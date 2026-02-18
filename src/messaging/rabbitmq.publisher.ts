import amqp from 'amqplib';
import { env } from '../config/env.js';

const EXCHANGE = 'franchise.events';

let channel: amqp.Channel | null = null;

function clearChannel(): void {
  channel = null;
}

export async function initPublisher(): Promise<void> {
  const conn = await amqp.connect(env.RABBITMQ_URL);

  conn.on('error', (err) => {
    console.error('[RabbitMQ] connection error:', err.message);
    clearChannel();
  });
  conn.on('close', () => {
    console.warn('[RabbitMQ] connection closed');
    clearChannel();
  });

  channel = await conn.createChannel();
  channel.on('error', (err) => {
    console.error('[RabbitMQ] channel error:', err.message);
    clearChannel();
  });
  channel.on('close', () => {
    clearChannel();
  });

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
