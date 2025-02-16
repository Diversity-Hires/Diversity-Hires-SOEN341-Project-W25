import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Notiflix from "notiflix";

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function CreateGroup({ open, setOpen, userList }) {
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    members: [],
  });

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setGroupData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle member selection
  const handleMemberSelect = (event) => {
    const selectedUser = event.target.value;
    if (!groupData.members.includes(selectedUser)) {
      setGroupData((prevState) => ({
        ...prevState,
        members: [...prevState.members, selectedUser],
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/groups/create`,
        {
          name: groupData.name,
          description: groupData.description,
          members: groupData.members,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
        }
      );

      Notiflix.Notify.success("Group created successfully!");
      setGroupData({ name: "", description: "", members: [] });
      setOpen(false);
    } catch (error) {
      Notiflix.Notify.failure(
        error.response?.data?.message || "Failed to create group."
      );
      console.error("Group creation error:", error);
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
                  <h3 className="text-base/7 font-semibold text-gray-900">
                    Create a New Group
                  </h3>
                  <p className="mt-1 text-sm/6 text-gray-900">
                    Enter group details below
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 border-t border-gray-100">
                    <dl className="divide-y divide-gray-100">
                      {/* Group Name */}
                      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium text-gray-900">
                          Group Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                          <input
                            name="name"
                            type="text"
                            className="w-full rounded-md px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-300 focus:outline-blue-600"
                            value={groupData.name}
                            onChange={handleInputChange}
                          />
                        </dd>
                      </div>

                      {/* Group Description */}
                      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium text-gray-900">
                          Description
                        </dt>
                        <dd className="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                          <textarea
                            name="description"
                            className="w-full rounded-md px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-300 focus:outline-blue-600"
                            value={groupData.description}
                            onChange={handleInputChange}
                          />
                        </dd>
                      </div>
                    </dl>

                    {/* Buttons */}
                    <div className="mt-6 flex items-center justify-end px-3 py-3 gap-x-6">
                      <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-gray-900">
                        Cancel
                      </button>

                      <button type="submit" className="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-400">
                        Create Group
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