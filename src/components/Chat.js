import React, { useState } from 'react';
// import { db } from '../firebase'; // Firebase config
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Chat({ messages, selectedServer }) {
  const [newMessage, setNewMessage] = useState('');

  if (!selectedServer) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Select a server to start chatting</div>;
  }

//   const sendMessage = async () => {
//     if (!newMessage.trim()) return;
//     await addDoc(collection(db, `servers/${selectedServer.id}/messages`), {
//       text: newMessage,
//       username: 'User1', // Replace with actual username
//       timestamp: serverTimestamp()
//     });
//     setNewMessage('');
//   };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-900 text-white">
      <h2 className="text-lg font-bold mb-4">{selectedServer.name}</h2>

      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className="bg-gray-800 p-2 rounded-md">
            <span className="font-semibold">{msg.username}:</span> {msg.text}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 p-2 bg-gray-800 rounded-md text-white"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="p-2 bg-blue-600 rounded-md" //add onClick={sendMessage}
        >
        Send
        </button>
      </div>
    </div>
  );
}
