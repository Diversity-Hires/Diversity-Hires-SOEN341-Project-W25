import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Notiflix from "notiflix";


// Assume you have your API_URL and API_KEY somewhere (env or config)
const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

export default function AddUser({ open, setOpen, userList, serverUsers }) {
  const [groupData, setGroupData] = useState({
    id: '',
    username: '',
    role: 'member',
  });

  const token = localStorage.getItem('token');

  // Filter out the current user
  const displayUsers = userList.filter((u) => !serverUsers.includes(u));

  // 1. Handle text/textarea changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setGroupData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  //Toggle a user on/off the members list
  const toggleMember = (username) => {
    setGroupData((prevState) => {
      if (prevState.members.includes(username)) {
        // Remove if already selected
        return {
          ...prevState,
          members: prevState.members.filter((u) => u !== username),
        };
      }
      // Otherwise, add
      return {
        ...prevState,
        members: [...prevState.members, username],
      };
    });
  };

  //Create group on form submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(
        `${API_URL}/servers/add-user`,
        {
          serverId: groupData.id,
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

      Notiflix.Notify.success('Server created successfully!');
      setGroupData({ name: '', description: '', members: [] });
      setOpen(false);
    } catch (error) {
      Notiflix.Notify.failure(
        error.response?.data?.message || 'Failed to create server.'
      );
      console.error('Server creation error:', error);
    }
  };

  return (

    
    <div className={`modal ${open ? 'block' : 'hidden'}`}>
    <div className="modal-content p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Add User to Server</h2>

      <form onSubmit={handleSubmit}>
        {/* Server ID Input */}
        <div className="mb-4">
          <label htmlFor="id" className="block text-lg font-medium text-gray-700">
            Server ID:
          </label>
          <input
            type="text"
            id="id"
            name="id"
            value={groupData.id}
            onChange={handleInputChange}
            className="mt-2 block w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Dropdown for selecting user */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-lg font-medium text-gray-700">
            Select User:
          </label>
          <select
            id="username"
            name="username"
            value={groupData.username}
            onChange={handleInputChange}
            className="mt-2 block w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            {displayUsers.map((user, index) => (
              <option key={index} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown for selecting role */}
        <div className="mb-6">
          <label htmlFor="role" className="block text-lg font-medium text-gray-700">
            Select Role:
          </label>
          <select
            id="role"
            name="role"
            value={groupData.role}
            onChange={handleInputChange}
            className="mt-2 block w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          Add User
        </button>
      </form>
    </div>
  </div>

  );
}