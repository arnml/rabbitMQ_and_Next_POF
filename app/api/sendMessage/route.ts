import { NextResponse } from 'next/server';
import amqp from 'amqplib';

export async function POST(req: Request) {
  let connection: amqp.Connection | null = null;
  let channel: amqp.Channel | null = null;

  try {
    const { topic } = await req.json();
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();

    const exchange = 'vt';
    const message = `Message for ${topic}`;

    // Directly publish to the exchange without asserting anything
    channel.publish(exchange, topic, Buffer.from(message), {
      messageId: `msg_${Date.now()}`,
      timestamp: Date.now(),
      contentType: 'text/plain',
    });

    console.log(`Sent message: ${message} to topic: ${topic}`);

    return NextResponse.json({ success: true, message: `Message sent to ${topic}` });
  } catch (error) {
    console.error('Error sending message', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}