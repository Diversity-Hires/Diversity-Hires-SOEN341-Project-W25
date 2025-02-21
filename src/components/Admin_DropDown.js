import React, { useState, useRef, useEffect } from "react";

export default function Dropdown({ open, setOpen, buttonRef, onActionSelect, messages, onDeleteMessages }) {
  const dropdownRef = useRef(null);
  const [selectingMessages, setSelectingMessages] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
        setSelectingMessages(false); // Exit selection mode when closing
        setSelectedMessages([]); // Clear selections
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setOpen, buttonRef]);

  useEffect(() => {
    if (open && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
      dropdownRef.current.style.left = `${buttonRect.left + window.scrollX}px`;
    }
  }, [open, buttonRef]);

  const handleActionClick = (action) => {
    if (action === "deleteMessages") {
      setSelectingMessages(true); // Enable message selection mode
    } else {
      onActionSelect(action);
      setOpen(false);
    }
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages((prevSelected) =>
      prevSelected.includes(messageId)
        ? prevSelected.filter((id) => id !== messageId)
        : [...prevSelected, messageId]
    );
  };

  const handleDeleteConfirm = () => {
    onDeleteMessages(selectedMessages); // Call parent function to delete
    setSelectingMessages(false);
    setSelectedMessages([]);
    setConfirmDelete(false);
  };

  return (
    <>
      {open && (
        <div
          ref={dropdownRef}
          className="bg-white shadow-lg rounded-md w-48 p-3 mt-2"
          style={{ zIndex: 1000 }}
        >
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleActionClick("changeRole")}
              className="w-full text-left text-sm text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Change Role
            </button>
            <button
              onClick={() => handleActionClick("deleteMessages")}
              className="w-full text-left text-sm text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Delete Messages
            </button>
          </div>
        </div>
      )}

      {/* Message selection UI */}
      {selectingMessages && (
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg mt-2">
          <h3 className="text-lg font-semibold mb-2">Select messages to delete</h3>
          <ul className="space-y-2">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`p-2 border rounded-md cursor-pointer ${
                  selectedMessages.includes(msg.id) ? "bg-red-300" : "bg-white"
                }`}
                onClick={() => toggleMessageSelection(msg.id)}
              >
                {msg.text}
              </li>
            ))}
          </ul>
          {selectedMessages.length > 0 && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Delete {selectedMessages.length} Message(s)
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
            <p>Do you want to delete {selectedMessages.length} messages?</p>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                No
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

