import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Notiflix from "notiflix";
import { getDatabase, ref, get, onValue, off } from 'firebase/database';


// Get API info
const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function ViewRequests({ open, setOpen, requests, currentUser, refresh }) {
    const token = localStorage.getItem('token');

    useEffect(() => {
        refresh();
    }, [open]);


    const denyRequest = async (username, serverId) => {
        try {
            const destinationRef = `${API_URL}/servers/request/deny`;
              
            const response = await axios.post(destinationRef,
              {
                username: username,
                serverId: serverId,
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
                'x-api-key': API_KEY,
              },
            });
            //refresh();
            Notiflix.Notify.success("Request denied!");
          } catch (error) {
            console.error('Error denying request:', error);
            // Optionally show an error notification
          }

    };


    const acceptRequest = async (username, serverId) => {
        try {
            const destinationRef = `${API_URL}/servers/request/accept`;
              
            const response = await axios.post(destinationRef,
              {
                username: username,
                serverId: serverId,
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
                'x-api-key': API_KEY,
              },
            });
            //refresh();
            Notiflix.Notify.success("Request accepted!");
          } catch (error) {
            console.error('Error accepting request:', error);
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
                        Pending requests
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">
                        Choose who can join your servers.
                    </p>

                    <form
                        //onSubmit={handleSubmit}
                        className="mt-6 border-t border-gray-100"
                    >

                        {/* Requests Section */}
                        <div className="px-4 py-4">
                            {/* Make it scrollable if the list is long */}
                            <div className="overflow-y-auto h-[40vh] border border-gray-200 rounded-md p-2">
                                <div className="grid grid-cols-1 gap-2">

                                {requests.length > 0 ? (
                                    requests.map((rq) => {
                                        return (
                                        <div
                                            key={rq.username}
                                            className="cursor-pointer flex justify-between px-3 py-2 rounded-md transition-colors bg-white hover:bg-gray-100"
                                        >
                                            <span className="text-base text-gray-800">{rq.username} <span className="text-xl"> ⇨ </span> {rq.serverName}</span>
                                            <div className="flex justify-center items-center gap-4">
                                                <button
                                                    type="button"
                                                    className="rounded-3xl bg-lime-500 px-3 py-2 text-xs font-small text-white hover:bg-lime-600"
                                                    
                                                    onClick={() => {
                                                        acceptRequest(rq.username, rq.serverId);
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    className="rounded-3xl bg-rose-500 px-3 py-2 text-xs font-small text-white hover:bg-rose-600"
                                                    onClick={() => {
                                                        denyRequest(rq.username, rq.serverId);
                                                    }}
                                                >
                                                    Deny
                                                </button>
                                            </div>
                                        </div>
                                        );
                                    })

                                ) : (
                                    <p className="flex items-center justify-center semibold text-gray-400 text-lg">No requests found</p>
                                )}
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