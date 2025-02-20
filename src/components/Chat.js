import React, { useState, useRef, useEffect } from 'react';
import Dropdown from './Admin_DropDown';
import p5 from 'p5';
// import { db } from '../firebase'; // Firebase config
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlusIcon, UserMinusIcon, Cog6ToothIcon} from '@heroicons/react/24/outline'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Bubbles from '../animations/Bubbles'


export default function Chat({ messages, selectedServer, isAdmin, openAddUser }) {
  
  const [newMessage, setNewMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const buttonRef = useRef(null); // Reference for the button

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    console.log("Selected action:", action);

  };


  if (!selectedServer) {
    return <div className="flex-1 flex items-center justify-center bg-gradient-to-t from-cyan-200 via-emerald-100 to-teal-50 text-indigo-800 ">Select a server to start chatting</div>;
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
  
    <div className="relative flex flex-col h-[calc(100vh-5rem)] p-4 bg-gradient-to-t from-cyan-200 via-emerald-100 to-teal-50 text-indigo-700  overflow-hidden">

       {/* Particle Background */}
       <Bubbles className="z-10"/>

      {/* Server name & action buttons in one flex row */}
      <div className="relative z-20 flex items-center border-b border-blue-900/30 pb-2 mb-4">
        <h2 className="text-2xl">{selectedServer.name}</h2>

        {/* Action buttons (only if isAdmin is true) */}
        {isAdmin && (
          <div className="flex items-center space-x-4 ml-2 border-l border-blue-900/30 pl-2">
            <button 
                onClick={openAddUser} 
                className="cursor-pointer hover:text-blue-500"
            >
                <UserPlusIcon className="h-6 w-6" />
            </button>

            <button className="cursor-pointer hover:text-blue-500">
            <UserMinusIcon className="h-6 w-6 cursor-pointer hover:text-blue-500" />
            </button>

            <button
            ref={buttonRef}
            onClick={() => setOpen(!open)}>
              
            <Cog6ToothIcon className="h-6 w-6 cursor-pointer hover:text-blue-500" />
            </button>
            <Dropdown
        open={open}
        setOpen={setOpen}
        onActionSelect={handleActionSelect}
        buttonRef={buttonRef}
        />
        {selectedAction && <p>Selected Action: {selectedAction}</p>}

          </div>
        )}
      </div>

      {/* Messages Display */}
      <div className="flex-1 z-20 overflow-y-auto space-y-2 ">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-indigo-100 p-2 px-3 rounded-xl max-w-fit">
            <span className="text-violet-800">{msg.username}: </span> 
            <span className="text-indigo-700">{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="mt-4 z-20 flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 p-2 bg-teal-50 rounded-md"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="p-2 bg-sky-300 rounded-md hover:bg-sky-400">
          Send
        </button>
      </div>
    </div>
  );

}




