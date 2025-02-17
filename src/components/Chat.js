import React, { useState } from 'react';
// import { db } from '../firebase'; // Firebase config
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlusIcon, UserMinusIcon, Cog6ToothIcon} from '@heroicons/react/24/outline'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'


export default function Chat({ messages, selectedServer, isAdmin, openAddUser }) {
  const [newMessage, setNewMessage] = useState('');

  if (!selectedServer) {
    return <div className="flex-1 flex items-center justify-center bg-gradient-to-t from-cyan-200 via-emerald-100 to-teal-50 text-indigo-800">Select a server to start chatting</div>;
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
    <div className="flex flex-col h-[calc(100vh-5rem)] p-4 bg-gradient-to-t from-cyan-200 via-emerald-100 to-teal-50 text-indigo-800">
      {/* Server name & action buttons in one flex row */}
      <div className="flex items-center border-b border-blue-900/30 pb-2 mb-4">
        <h2 className="text-xl font-bold">{selectedServer.name}</h2>

        {/* Action buttons (only if isAdmin is true) */}
        {isAdmin && (
          <div className="flex items-center space-x-4 ml-2 border-l border-blue-900/30 pl-2">
            <button 
                onClick={openAddUser} 
                className="cursor-pointer hover:text-blue-500"
            >
                <UserPlusIcon className="h-6 w-6" />
            </button>
            <UserMinusIcon className="h-6 w-6 cursor-pointer hover:text-blue-500" />
            <Cog6ToothIcon className="h-6 w-6 cursor-pointer hover:text-blue-500" />
          </div>
        )}
      </div>

      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-sky-100 p-2 rounded-md">
            <span className="font-semibold">{msg.username}:</span> {msg.text}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 p-2 bg-teal-50 rounded-md text-indigo-800"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="p-2 bg-sky-300 rounded-md text-indigo-800 hover:bg-sky-400">
          Send
        </button>
      </div>
    </div>
  );
}
