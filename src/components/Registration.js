import React, { useState, useEffect }  from 'react';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Notiflix from 'notiflix';

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function Registration({ open, setOpen, user, pass }) {
    const [userData, setUserData] = useState({
        username: user || '',
        password: pass || ''
    });

    // Update state when props change
    useEffect(() => {
      setUserData({
          username: user || '',
          password: pass || ''
      });
  }, [user, pass]);

    // Handle input change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUserData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        let failMessage = '';

        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                username: userData.username,
                password: userData.password
            }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY // Include the API Key
                }
            });

            // Save failed registration message if there is one
            if (res.data.message) {
                failMessage = res.data.message;
            }

            Notiflix.Notify.success("Registration was successful. Please log in!");
            
            // Reset the form after successful registration
            setUserData({ username: '', password: '' });

            // Optionally close the modal
            setOpen(false);
        } catch (error) {
            // Handle error response correctly
            if (error.response && error.response.data && error.response.data.message) {
                failMessage = error.response.data.message;
            } else {
                failMessage = 'Registration failed. Please try again.';
            }

            Notiflix.Notify.failure(failMessage);
            console.error('Registration error:', error);
        }
    };

    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
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
                                    <div className="px-4 sm:px-0">
                                        <h3 className="text-lg/7 font-medium text-gray-900">Register</h3>
                                        <p className="mt-1 max-w-2xl text-sm/6 text-gray-900">Enter your information</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="mt-6 border-t border-gray-100">
                                        <dl className="divide-y divide-gray-100">
                                            {/* Username Field */}
                                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                                <dt className="text-sm/6 text-gray-900">Username</dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                    <input
                                                        id="username"
                                                        name="username"
                                                        type="text"
                                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300
                                                        placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                                                        value={userData.username}
                                                        onChange={handleInputChange}
                                                    />
                                                </dd>
                                            </div>

                                            {/* Password Field */}
                                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                                <dt className="text-sm/6 text-gray-900">Password</dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                    <input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300
                                                        placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                                                        value={userData.password}
                                                        onChange={handleInputChange}
                                                    />
                                                </dd>
                                            </div>
                                        </dl>

                                        {/* Save and Cancel Buttons Section */}
                                        <div className="mt-6 flex items-center justify-end px-3 py-3 gap-x-6">
                                            <button 
                                                type="button" 
                                                id="cancelBtn"
                                                onClick={() => setOpen(false)}
                                                className="text-sm/6 font-medium text-gray-900"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                id="saveBtn"
                                                className="rounded-md bg-accentBlue px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                                            >
                                                Register
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
