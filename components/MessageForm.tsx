"use client"; 
import { useState } from 'react';


const MessageForm: React.FC = () => {
  const [client, setClient] = useState<string>('');
  const [messageType, setMessageType] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (client && messageType) {
      const topic = `${client}.${messageType}`;
      
      try {
        const response = await fetch('/api/sendMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });

        const data = await response.json();
        if (data.success) {
          alert(`Message sent to ${topic}`);
        } else {
          alert('Failed to send message');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error sending message');
      }
    } else {
      alert('Please select both client and message type');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label className="block mb-2">Select Client</label>
        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="p-2 border rounded w-full text-black"
        >
          <option value="">-- Select Client --</option>
          <option value="client1">Client 1</option>
          <option value="client2">Client 2</option>
          <option value="client3">Client 3</option>
        </select>
      </div>

      <div>
        <label className="block mb-2">Select Message Type</label>
        <select
          value={messageType}
          onChange={(e) => setMessageType(e.target.value)}
          className="p-2 border rounded w-full text-black"
        >
          <option value="">-- Select Type --</option>
          <option value="log">Log</option>
          <option value="ticket">Ticket</option>
        </select>
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Send Message
      </button>
    </form>
  );
};

export default MessageForm;
