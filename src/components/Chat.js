import React, { useState, useRef, useEffect } from 'react';
import AdminDropdown from './Admin_DropDown';
import p5 from 'p5';
// import { db } from '../firebase'; // Firebase config
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  UserPlusIcon,
  UserMinusIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import Bubbles from '../animations/Bubbles';
import axios from 'axios';
import Notiflix from 'notiflix';
import UserStatusIndicator from './UserStatusIndicator';

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function Chat({
  messages,
  selectedServer,
  isAdmin,
  openAddUser,
  openRemoveUser,
  openChangeRole,
  selectedMessages,
  handleMessageSelect,
  isDeleteMode,
  handleDeleteModeToggle,
  getUpdatedRoles,
  serverMode,
  currentUser,
  refresh
}) {
  const [newMessage, setNewMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const buttonRef = useRef(null);

  const token = localStorage.getItem('token');

  // Track the status + lastChanged for "last seen" display
  const [status, setStatus] = useState('offline');
  const [lastChanged, setLastChanged] = useState(null);

  useEffect(() => {
    console.log('Selected messages:', selectedMessages);
  }, [selectedMessages]);

  if (!selectedServer) {
    if (serverMode){
      return <div className="flex-1 flex items-center justify-center bg-gradient-to-t from-cyan-200 via-emerald-100 to-teal-50 text-indigo-800 ">Select a server to start chatting</div>;
    }else {
      return <div className="flex-1 flex items-center justify-center bg-gradient-to-t from-cyan-200 via-emerald-100 to-teal-50 text-indigo-800 ">Select a friend to start chatting with</div>;
    }
  }

  // Callback from UserStatusIndicator whenever presence changes
  const handlePresenceChange = (newStatus, newLastChanged) => {
    setStatus(newStatus);
    setLastChanged(newLastChanged);
  };

  const deleteMessages = async () => {
    try {
      await axios.delete(`${API_URL}/servers/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        data: {
          serverId: selectedServer.id,
          selectedMessages
        }
      });
      Notiflix.Notify.success('Messages deleted successfully');
    } catch (error) {
      Notiflix.Notify.failure(
        error.response?.data?.message || 'Failed to delete messages.'
      );
      console.error('Message deletion error:', error);
    }
  };

  const sendMessage = async () => {
    try {
      const destinationRef = serverMode
        ? `${API_URL}/servers/messages`
        : `${API_URL}/dms/messages`;

      await axios.post(
        destinationRef,
        {
          text: newMessage,
          serverId: selectedServer.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': API_KEY
          }
        }
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const removeUser = async (user) => {
    try {
      await axios.delete(`${API_URL}/servers/remove-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        data: {
          serverId: selectedServer.id,
          username: user
        }
      });
      Notiflix.Notify.success('User exited server successfully');
      refresh();
    } catch (error) {
      Notiflix.Notify.failure(
        error.response?.data?.message || 'Failed to remove user.'
      );
      console.error('User removal error:', error);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-5rem)] p-4 bg-gradient-to-t from-cyan-200 via-emerald-100 to-teal-50 text-indigo-700 overflow-hidden">
      {/* Particle Background */}
      <Bubbles className="z-10" />

      {/* Header: name + presence + admin buttons */}
      <div className="flex justify-between border-b border-blue-900/30 pb-2 mb-4">
        <div className="relative z-20 flex items-center">
          <div className="flex flex-col">
            {/* Row 1: Dot on left, Name on right */}
            <div className="flex items-center">
              {/* Only show presence if not in server mode */}
              {!serverMode && (
                <UserStatusIndicator
                  username={selectedServer.name}
                  onPresenceChange={handlePresenceChange}
                />
              )}
              <h2 className="text-2xl ml-2">{selectedServer.name}</h2>
            </div>

            {/* Row 2: last seen if offline */}
            {!serverMode && status === 'offline' && lastChanged && (
              <div className="text-xs text-gray-500 mt-1">
                Last seen: {new Date(lastChanged).toLocaleString()}
              </div>
            )}
          </div>

          {/* Action buttons (only if isAdmin is true) */}
          {isAdmin && (
            <div className="flex items-center space-x-4 ml-2 border-l border-blue-900/30 pl-2">
              <button
                onClick={openAddUser}
                className="cursor-pointer hover:text-blue-500"
              >
                <UserPlusIcon className="h-6 w-6" />
              </button>

              <button
                onClick={openRemoveUser}
                className="cursor-pointer hover:text-blue-500"
              >
                <UserMinusIcon className="h-6 w-6 cursor-pointer hover:text-blue-500" />
              </button>

              <button ref={buttonRef} onClick={() => setOpen(!open)}>
                <Cog6ToothIcon className="h-6 w-6 cursor-pointer hover:text-blue-500" />
              </button>
              <AdminDropdown
                open={open}
                setOpen={setOpen}
                deleteMessages={deleteMessages}
                isDeleteMode={isDeleteMode}
                handleDeleteModeToggle={handleDeleteModeToggle}
                buttonRef={buttonRef}
                selectedMessages={selectedMessages}
                handleMessageSelect={handleMessageSelect}
                openChangeRole={openChangeRole}
                getUpdatedRoles={getUpdatedRoles}
              />
              {selectedAction && <p>Selected Action: {selectedAction}</p>}
            </div>
          )}
        </div>

        {/* If in server mode, show a button to leave the server */}
        {serverMode && (
          <button
            className="cursor-pointer hover:text-blue-500"
            onClick={() =>
              Notiflix.Confirm.show(
                'Please Confirm',
                `Are you sure you want to leave ${selectedServer.name}?`,
                'Yes',
                'No',
                () => removeUser(currentUser),
                () => {}
              )
            }
          >
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 mr-2" />
          </button>
        )}
      </div>

      {/* Messages display */}
      <div className="flex-1 z-10 overflow-y-auto space-y-2">
        {messages.map((msg) => {
          const dateObj = new Date(msg.timestamp);
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const year = String(dateObj.getFullYear()).slice(-2);
          const formattedTimestamp = `${hours}:${minutes} ${day}/${month}/${year}`;

          return (
            <div
              key={msg.id}
              onClick={() => {
                if (isDeleteMode) {
                  handleMessageSelect(msg.id);
                }
              }}
              className={`p-2 px-3 rounded-xl max-w-fit ${
                selectedMessages.includes(msg.id) ? 'bg-red-200' : 'bg-indigo-100'
              }`}
            >
              <div>
                <span className={`${currentUser===msg.username ? 'text-sky-700' : 'text-violet-800'} font-semibold`}>{msg.username}</span>
                <span className="ml-2 text-indigo-700">{msg.text}</span>
              </div>
              <div className="text-xs text-gray-500">{formattedTimestamp}</div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <div className="relative mt-4 z-20 flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 p-2 bg-teal-50 rounded-md"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="p-2 bg-sky-300 rounded-md hover:bg-sky-400">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}