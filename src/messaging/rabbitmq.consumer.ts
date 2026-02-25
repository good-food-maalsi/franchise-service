import amqp from "amqplib";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { orderCreatedEventSchema } from "@good-food/contracts/events";

const EXCHANGE = "good-food-events";
const QUEUE = "franchise.stock.order.events";
const ROUTING_KEY = "order.created";

export async function startConsumer(): Promise<void> {
    const conn = await amqp.connect(
        env.RABBITMQ_URL || "amqp://user:password@localhost",
        { heartbeat: 120 },
    );

    conn.on("error", (err) =>
        console.error(
            "[RabbitMQ Consumer] connection error (non-fatal):",
            err?.message ?? err,
        ),
    );
    conn.on("close", () =>
        console.warn(
            "[RabbitMQ Consumer] connection closed (reconnect not implemented)",
        ),
    );

    const channel = await conn.createChannel();
    channel.on("error", (err) =>
        console.error(
            "[RabbitMQ Consumer] channel error (non-fatal):",
            err?.message ?? err,
        ),
    );
    channel.on("close", () =>
        console.warn("[RabbitMQ Consumer] channel closed"),
    );

    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });
    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
    channel.prefetch(1);

    console.log(
        `[RabbitMQ Consumer] Listening on queue "${QUEUE}" for routing key "${ROUTING_KEY}"`,
    );

    channel.consume(QUEUE, async (msg) => {
        if (!msg) return;
        let event;
        try {
            const raw = JSON.parse(msg.content.toString());
            event = orderCreatedEventSchema.parse(raw);
        } catch (err) {
            console.error(
                "[RabbitMQ Consumer] order.created parse error:",
                err,
            );
            return channel.nack(msg, false, false); // Malformed, drop it
        }

        try {
            console.log(
                `[RabbitMQ Consumer] Received order.created. Order: ${event.orderId}, Franchise: ${event.shopId}, Items: ${event.items.length}`,
            );

            const CATALOG_URL =
                process.env.CATALOG_SERVICE_URL || "http://catalog-nginx";
            const stockReductions: Map<string, number> = new Map(); // stock_id -> quantity to reduce

            // Aggregate total stock reduction needed
            for (const item of event.items) {
                // First try to fetch as a dish
                let response = await fetch(
                    `${CATALOG_URL}/dish/${item.itemId}`,
                );
                if (response.ok) {
                    const data = await response.json();
                    const ingredients = data.data?.ingredients || [];
                    for (const ing of ingredients) {
                        const current = stockReductions.get(ing.stock_id) || 0;
                        stockReductions.set(
                            ing.stock_id,
                            current + ing.quantity_required * item.quantity,
                        );
                    }
                    continue;
                }

                if (response.status === 404) {
                    // Try to fetch as a menu
                    response = await fetch(
                        `${CATALOG_URL}/menu/${item.itemId}`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        const dishes = data.data?.Dish || [];
                        // We deduct ingredients for all dishes in the menu.
                        // (Note: If items have selected options or specific chosen dishes, it's not currently modeled in the order event clearly, so we assume all dishes or default dishes of the menu for now)
                        for (const dish of dishes) {
                            // Fetch dish ingredients
                            const dishRes = await fetch(
                                `${CATALOG_URL}/dish/${dish.id}`,
                            );
                            if (dishRes.ok) {
                                const dishData = await dishRes.json();
                                const ingredients =
                                    dishData.data?.ingredients || [];
                                for (const ing of ingredients) {
                                    const current =
                                        stockReductions.get(ing.stock_id) || 0;
                                    stockReductions.set(
                                        ing.stock_id,
                                        current +
                                            ing.quantity_required *
                                                item.quantity,
                                    );
                                }
                            }
                        }
                        continue;
                    }
                }

                console.warn(
                    `[RabbitMQ Consumer] Could not resolve ingredients for item ${item.itemId}`,
                );
            }

            if (stockReductions.size === 0) {
                console.log(
                    `[RabbitMQ Consumer] No stock to reduce for order ${event.orderId}`,
                );
                return channel.ack(msg);
            }

            // Apply stock reductions
            // Using a transaction to ensure all or nothing
            await prisma.$transaction(async (tx) => {
                for (const [
                    stockId,
                    quantityToReduce,
                ] of stockReductions.entries()) {
                    // Find the existing stock entry for this franchise and ingredient (stockId)
                    // The stockId from catalog actually corresponds to the ingredient.id in franchise
                    const stock = await tx.stockFranchise.findFirst({
                        where: {
                            franchise_id: event.shopId,
                            ingredient_id: stockId, // catalog's stock_id is franchise's ingredient_id usually
                        },
                    });

                    if (stock) {
                        const newQuantity = Math.max(
                            0,
                            stock.quantity - quantityToReduce,
                        );
                        await tx.stockFranchise.update({
                            where: { id: stock.id },
                            data: { quantity: newQuantity },
                        });
                        console.log(
                            `[RabbitMQ Consumer] Reduced stock for ingredient ${stockId} heavily by ${quantityToReduce}. New quantity: ${newQuantity}`,
                        );
                    } else {
                        console.warn(
                            `[RabbitMQ Consumer] Stock not found for ingredient ${stockId} in franchise ${event.shopId}`,
                        );
                    }
                }
            });

            console.log(
                `[RabbitMQ Consumer] Successfully processed stock reduction for order ${event.orderId}`,
            );
            channel.ack(msg);
        } catch (err) {
            console.error("[RabbitMQ Consumer] processing error:", err);
            // Requeue the message and try again later
            channel.nack(msg, false, true);
        }
    });
}
