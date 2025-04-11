import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Notiflix from "notiflix";
import { getDatabase, ref, get, onValue, off } from 'firebase/database';


// Get API info
const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function JoinServer({ open, setOpen, servers, currentServers, currentUser, refresh }) {
    const [search, setSearch] = useState('');
    const [requestsSent, setRequestsSent] = useState([]);
    const [displayServers, setDisplayServers] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchRequestsSent();
    }, [open]);

    // Filter servers by search and remove currents servers
    useEffect(() => {
    if (!servers || !currentServers) return; // Prevent running if undefined
    const tempservers = servers.filter(
        (u) => 
          u.name.toLowerCase().includes(search.toLowerCase()) && 
          !(currentServers ?? []).some((someServer) => someServer.id === u.id)
      );
    
    setDisplayServers(tempservers);
    }, [servers, currentServers, search]); 


    const fetchRequestsSent = async () => {
        const db = getDatabase();
        const serversRef = ref(db, 'servers');
        // Turn off any existing listeners
        off(serversRef);
  
        try {
          // Fetch all servers once
          const snapshot = await get(serversRef);
          if (snapshot.exists()) {
            const serversData = snapshot.val();
            const updatedRequests = [];
  
            // Loop through all servers
            for (const serverId in serversData) {
              const server = serversData[serverId];
              // Check if this server has a requests node and if it contains currentUser
              if (server.requests && server.requests[currentUser]) {
                updatedRequests.push(serverId);
              }
            }
  
            // Now you have a list of serverIds for which the current user has made a request
            // Set or return it as needed
            setRequestsSent(updatedRequests);
          } else {
            // No servers exist
            setRequestsSent([]);
          }
        } catch (err) {
          console.error('Error fetching requestsSent:', err);
        }
    };


    const requestJoinServer = async (serverId) => {
        // Add serverId to requestsSent array only if not already present
        setRequestsSent(prevRequests => {
            if (!prevRequests.includes(serverId)) {
            return [...prevRequests, serverId];
            }
            return prevRequests;
        });

        try {
            const destinationRef = `${API_URL}/servers/join`;
              
            const response = await axios.post(destinationRef,
              {
              serverId: serverId,
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
                'x-api-key': API_KEY,
              },
            });
            fetchRequestsSent();
            Notiflix.Notify.success("Request sent successfully!");
          } catch (error) {
            console.error('Error sending request:', error);
            // Optionally show an error notification
          }

    };


    return (
        <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-30" onClose={() => setOpen(false)}>
            {/* Backdrop */}
            <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* Modal Panel */}
            <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
                >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                    {/* Close Button */}
                    <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                    >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="size-6" />
                    </button>

                    {/* Form Section */}
                    <div className="px-6 py-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Request to join a server
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">
                        Select servers to send a request to
                    </p>

                    <form
                        //onSubmit={handleSubmit}
                        className="mt-6 border-t border-gray-100"
                    >
                        {/* Search Bar */}
                        <div className="relative flex-1 mb-4">
                            <input
                                type="text"
                                placeholder="Search for a server"
                                className="w-full p-2 pl-4 pr-10 bg-white rounded-md text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {/* Search Icon inside Input */}
                            <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 
                                    7.5 0 1 0 5.196 5.196a7.5 7.5 
                                    0 0 0 10.607 10.607Z"
                                />
                                </svg>
                            </div>
                        </div>

                        {/* Server Selection Section */}
                        <div className="px-4 py-4">
                            {/* Make it scrollable if the list is long */}
                            <div className="overflow-y-auto h-[40vh] border border-gray-200 rounded-md p-2">
                                <div className="grid grid-cols-1 gap-2">
                                {displayServers.map((server) => {
                                    const isAlreadyRequested = requestsSent.includes(server.id);
                                    return (
                                    <div
                                        key={server.id}
                                        className="cursor-pointer flex justify-between px-3 py-2 rounded-md transition-colors bg-white hover:bg-gray-100"
                                    >
                                        <span className="text-sm text-gray-800">{server.name}</span>
                                        <button
                                            type="button"
                                            className={
                                                isAlreadyRequested
                                                  ? "rounded-3xl bg-indigo-300 px-3 py-2 text-xs font-small text-white cursor-not-allowed"
                                                  : "rounded-3xl bg-violet-600 px-3 py-2 text-xs font-small text-white hover:bg-violet-700"
                                              }
                                            onClick={() => {
                                                requestJoinServer(server.id);
                                            }}
                                        >
                                            Request to join
                                        </button>
                                    </div>
                                    );
                                })}
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-6 flex items-center justify-end px-3 py-3 gap-x-6">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium text-gray-900"
                        >
                            Back
                        </button>
                        {/* <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                        >
                            Start chatting
                        </button> */}
                        </div>
                    </form>
                    </div>
                </Dialog.Panel>
                </Transition.Child>
            </div>
            </div>
        </Dialog>
        </Transition>
    );
    }