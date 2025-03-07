import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import Notiflix from "notiflix"; // Used for notifications

// Use fallback API URL if .env is missing
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const API_KEY = process.env.REACT_APP_API_KEY || "default-api-key"; 

export default function ChangeRoleModal({ open, setOpen, user, serverId, updateUserRole }) {
  // Ensure selected role updates when user changes
  const [selectedRole, setSelectedRole] = useState(user?.role || "member");

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || "member");
    }
  }, [user]);

  // Get authentication token
  const token = localStorage.getItem('token');

  // Handle role change request
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.patch(
        `${API_URL}/servers/update-role`,
        {
          serverId,
          userId: user.id,
          newRole: selectedRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      // Show success notification
      Notiflix.Notify.success(`Role updated to ${selectedRole}!`);

      // Update role in frontend state
      updateUserRole(user.id, selectedRole);

      // Close modal after successful update
      setOpen(false);
    } catch (error) {
      Notiflix.Notify.failure(error.response?.data?.message || "Failed to update role.");
      console.error("Role update error:", error);
    }
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div className="px-6 py-6">
                  <h3 className="text-lg font-medium text-gray-900">Change User Role</h3>

                  <form onSubmit={handleSubmit} className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Select New Role:</label>
                    <select
                      className="w-full mt-2 p-2 border rounded-md"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>

                    <div className="mt-4 flex justify-end">
                      <button type="button" onClick={() => setOpen(false)} className="mr-2 text-gray-700">
                        Cancel
                      </button>
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                        Save Changes
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