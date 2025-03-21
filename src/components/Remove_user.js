import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Notiflix from "notiflix";

// Assume you have your API_URL and API_KEY somewhere (env or config)
const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function RemoveUser({ open, setOpen, serverId, userList, serverUsers, updateUserList }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [displayUsers, setDisplayUsers] = useState([]); 

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!serverUsers || serverUsers.length === 0) {
        setDisplayUsers([]); 
        return;
    }

    setDisplayUsers(serverUsers.map(user => user.username));

}, [serverUsers]);

  // Handle user removal
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUser) {
        Notiflix.Notify.warning("Please select a user to remove.");
        return;
    }

    const userToRemove = serverUsers.find(user => user.username === selectedUser);

    if (!userToRemove) {
        Notiflix.Notify.failure("User not found in server list.");
        return;
    }

    try {
        await axios.delete(
            `${API_URL}/servers/remove-user`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY,
                },
                data: {
                    serverId: serverId,
                    username: userToRemove.username, 
                },
            }
        );

        Notiflix.Notify.success("User removed successfully!");
        updateUserList(selectedUser);
        setOpen(false);
    } catch (error) {
        Notiflix.Notify.failure(error.response?.data?.message || "Failed to remove user.");
        console.error("User removal error:", error);
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
                  <h3 className="text-lg font-medium text-gray-900">
                    Remove User from Server
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    Please select a user to remove.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-6 border-t border-gray-100"
                  >
                    <dl className="divide-y divide-gray-100">

                      {/* User Dropdown */}
                      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm text-gray-900">Select User</dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                          <select
                            id="username"
                            name="username"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full rounded-md px-3 py-1.5 bg-gray-50 outline outline-1 outline-gray-300 focus:outline-red-600"
                          >
                            {/* Default option */}
                            <option value="" disabled>-- Select a user --</option>

                            {displayUsers.map((user, index) => (
                              <option key={index} value={user}>
                                {user}
                              </option>
                            ))}
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
                        className="text-sm font-medium text-gray-900"
                      >
                        Cancel
                      </button>

                      {/* Remove Button */}
                      <button
                        type="submit"
                        className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                      >
                        Remove User
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