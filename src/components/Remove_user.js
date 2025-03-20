import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Notiflix from "notiflix";

export default function RemoveUser({ open, setOpen, serverUsers, updateUserList }) {
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    if (!serverUsers) resizeTo
  }, [open, serverUsers]);

  const handleRemoveUser = (event) => {
    event.preventDefault();

    if (!selectedUser) {
      Notiflix.Notify.warning("Please select a user to remove.");
      return;
    }

    Notiflix.Notify.success(`User ${selectedUser} removed successfully!`);
    
    updateUserList(selectedUser);

    setSelectedUser(""); 
    setOpen(false); 
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={() => setOpen(false)}>
        {/* Modal Background */}
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                {/* Form Section */}
                <div className="px-6 py-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Remove User from Server
                  </h3>

                  {/* User Selection Dropdown */}
                  <div className="mt-4">
                    <label className="text-sm text-gray-900">Select User:</label>
                    <select
                      className="w-full mt-2 p-2 border rounded-md"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                    >
                      <option value="" disabled>-- Select a user --</option>
                      {serverUsers && serverUsers.map((user, index) => (
                        <option key={index} value={user.username}>{user.username}</option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex justify-end">
                    <button type="button" onClick={() => setOpen(false)} className="mr-2 text-gray-700">
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      onClick={handleRemoveUser}
                      className="bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Remove User
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}