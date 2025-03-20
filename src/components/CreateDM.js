import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Notiflix from "notiflix";


// Get API info
const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function CreateDM({ open, setOpen, userList, currentUser, refresh, currentDMs }) {
    const [search, setSearch] = useState('');
    const [selectedUserToDM, setSelectedUserToDM] = useState('');
    const [displayUsers, setDisplayUsers] = useState([]);

    const token = localStorage.getItem('token');

    // Filter users by search, remove currents DMs and remove currentUser
    useEffect(() => {
    if (!userList || !currentDMs) return; // Prevent running if undefined
    const tempusers = userList.filter(
        (u) => 
          u !== currentUser && 
          u.toLowerCase().includes(search.toLowerCase()) && 
          !(currentDMs ?? []).some((someUser) => someUser.name === u)
      );
    
    setDisplayUsers(tempusers);
    }, [userList, currentDMs, search]); 


    //Create group on form submit
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
        await axios.post(
            `${API_URL}/new-dm`,
            {
            users: [currentUser, selectedUserToDM],
            },
            {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
            }
        );

        Notiflix.Notify.success('You can now DM this person!');
        setSelectedUserToDM('');
        setSearch('');
        refresh();
        setOpen(false);
        } catch (error) {
        Notiflix.Notify.failure(
            error.response?.data?.message || 'Failed to create DM.'
        );
        console.error('DM creation error:', error);
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
                        New Direct Message
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">
                        Select a user to start chatting with
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 border-t border-gray-100"
                    >
                        {/* Search Bar */}
                        <div className="relative flex-1 mb-4">
                            <input
                                type="text"
                                placeholder="Search for a friend"
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

                        {/* User Selection Section */}
                        <div className="px-4 py-4">
                            {/* Make it scrollable if the list is long */}
                            <div className="overflow-y-auto h-[40vh] border border-gray-200 rounded-md p-2">
                                <div className="grid grid-cols-1 gap-2">
                                {displayUsers.map((user) => {
                                    const isSelected = selectedUserToDM === user;
                                    return (
                                    <div
                                        key={user}
                                        onClick={() => setSelectedUserToDM(user)}
                                        className={`cursor-pointer px-3 py-2 rounded-md transition-colors 
                                        ${isSelected ? 'bg-blue-200' : 'bg-white'} 
                                        hover:bg-blue-100`}
                                    >
                                        <span className="text-sm text-gray-800">{user}</span>
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
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                        >
                            Start chatting
                        </button>
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