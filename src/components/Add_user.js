import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Notiflix from "notiflix";


// Assume you have your API_URL and API_KEY somewhere (env or config)
const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function AddUser({ open, setOpen, serverId, userList, serverUsers }) {
  const [groupData, setGroupData] = useState({
    username: '',
    role: 'member',
  });
  const [displayUsers, setDisplayUsers] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userList || !serverUsers) return; // Prevent running if undefined
  
    const tempusers = userList.filter(
      (u) => !(serverUsers ?? []).some((srvUser) => srvUser.username === u)
    );
  
    setDisplayUsers(tempusers);
  }, [userList, serverUsers]); 


 
  // 1. Handle text/textarea changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setGroupData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  //Create group on form submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(
        `${API_URL}/servers/add-user`,
        {
          serverId: serverId,
          username: groupData.username,
          role: groupData.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      Notiflix.Notify.success('User added successfully!');
      setGroupData({ username: '', role: 'member'});
      setOpen(false);
    } catch (error) {
      Notiflix.Notify.failure(
        error.response?.data?.message || 'Failed to add user.'
      );
      console.error('User addition error:', error);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                {/* Close Button X */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>

                {/* Form Section */}
                <div className="px-6 py-6">
                  <h3 className="text-base font-semibold text-gray-900">
                    Add User to Server
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    Please select a user and their role.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-6 border-t border-gray-100"
                  >
                    <dl className="divide-y divide-gray-100">

                        {/* User Dropdown */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium text-gray-900">
                            Select User
                        </dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                            <select
                            id="username"
                            name="username"
                            value={groupData.username}
                            onChange={handleInputChange}
                            className="w-full rounded-md px-3 py-1.5 bg-gray-50 outline outline-1 outline-gray-300 focus:outline-indigo-600"
                            >
                            {/* Dummy default option */}
                            <option value="" disabled>
                                -- Select a user --
                            </option>

                            {/* Actual user options */}
                            {displayUsers.map((user, index) => (
                                <option key={index} value={user}>
                                {user}
                                </option>
                            ))}
                            </select>
                        </dd>
                        </div>

                      {/* Role Dropdown */}
                      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium text-gray-900">
                          Select Role
                        </dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                          <select
                            id="role"
                            name="role"
                            value={groupData.role}
                            onChange={handleInputChange}
                            className="w-full rounded-md px-3 py-1.5 bg-gray-50 outline outline-1 outline-gray-300 focus:outline-indigo-600"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </dd>
                      </div>
                    </dl>

                    {/* Buttons */}
                    <div className="mt-6 flex items-center justify-end px-3 py-3 gap-x-6">
                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="text-sm font-semibold text-gray-900"
                      >
                        Cancel
                      </button>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                      >
                        Add User
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
