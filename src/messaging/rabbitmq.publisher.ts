import amqp from 'amqplib';
import { env } from '../config/env.js';

const EXCHANGE = 'franchise.events';

let channel: amqp.Channel | null = null;

export async function initPublisher(): Promise<void> {
  const conn = await amqp.connect(env.RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
}

export async function publishEvent(
  routingKey: string,
  payload: object
): Promise<void> {
  if (!channel) return;
  try {
    channel.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );
  } catch (err) {
    console.error('[RabbitMQ] publish error:', err);
  }
}
