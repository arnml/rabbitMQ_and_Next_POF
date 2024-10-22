import React from 'react';
import amqp from 'amqplib';

interface QueueMessage {
  id: string;
  timestamp: string;
  content: string;
  status: string;
}

async function getQueueMessages(queueName: string): Promise<QueueMessage[]> {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'vt';
    const queue = queueName;

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });

    const messages: QueueMessage[] = [];
    const messageCount = 100;
    for (let i = 0; i < messageCount; i++) {
      const message = await channel.get(queue, { noAck: false });
      if (message) {
        console.log(message);

        const content = message.content.toString();
        messages.push({
          id: message.properties.messageId || `msg_${i}`,
          timestamp: new Date(message.properties.timestamp).toLocaleString(),
          content: content,
          status: 'received',
        });
        channel.ack(message); // Acknowledge the message
      } else {
        break;
      }
    }

    await channel.close();
    await connection.close();

    return messages;
  } catch (error) {
    console.error('Error fetching queue messages:', error);
    return [];
  }
}

export default async function QueueLogPage({ queueName = 'log_queue' }: { queueName?: string }) {
  const messages = await getQueueMessages(queueName);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">VT Exchange Queue Log: {queueName}</h1>
      {messages.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Message ID</th>
                <th className="py-2 px-4 border-b">Timestamp</th>
                <th className="py-2 px-4 border-b">Content</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id} className="text-black">
                  <td className="py-2 px-4 border-b">{message.id}</td>
                  <td className="py-2 px-4 border-b">{message.timestamp}</td>
                  <td className="py-2 px-4 border-b">{message.content}</td>
                  <td className="py-2 px-4 border-b">{message.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No messages found in the queue.</p>
      )}
    </div>
  );
}
