import app from "./app.js";
import { env } from "./config/env.js";
import { initPublisher } from "./messaging/rabbitmq.publisher.js";
import { startConsumer } from "./messaging/rabbitmq.consumer.js";

const PORT = env.PORT;

app.listen(PORT, async () => {
    console.log(`🚀 Franchise service running on port ${PORT}`);
    console.log(`📍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    try {
        await initPublisher();
        console.log("🐇 RabbitMQ publisher connected");

        await startConsumer();
        console.log("🐇 RabbitMQ consumer connected");
    } catch (err) {
        console.error("[RabbitMQ] init failed (non-fatal):", err);
    }
});
