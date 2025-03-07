import React, { useState, useRef, useEffect } from "react";
import ChangeRoleModal from "./ChangeRoleModal"; // Import the Change Role modal

export default function Dropdown({ open, setOpen, buttonRef, deleteMessages, selectedMessages, isDeleteMode, handleMessageSelect, handleDeleteModeToggle, serverId, users }) {
  const dropdownRef = useRef(null);
  console.log("Users in dropdown:", users);

  // State to manage Change Role modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      dropdownRef.current.style.position = 'absolute';
    }
  }, [open, buttonRef]);

  // Handle actions inside the dropdown
  const handleActionClick = (input, user = null) => {
    if (input === "deleteMessages") {
      handleDeleteModeToggle();
    } else if (input === "changeRole" && user) {
      setSelectedUser(user); // Store selected user
      setIsRoleModalOpen(true); // Open the modal
    }
  };

  const handleConfirmDelete = () => {
    deleteMessages();
    setConfirmDelete(false);
    handleDeleteModeToggle();
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="absolute bg-white shadow-lg rounded-md w-48 p-3 mt-40 z-40">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setOpen(false);
                handleMessageSelect();
                if (isDeleteMode) {
                  handleDeleteModeToggle();
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!isDeleteMode ? (
            <div className="flex flex-col space-y-2">
              {/* Dropdown for selecting a user and changing role */}
              {users && users.length > 0 ? (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleActionClick("changeRole", user)}
                    className="w-full text-left text-sm text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    Change Role - {user.username}
                  </button>
                ))
              ) : (
                <button
                  onClick={() => console.log("Forced Change Role Button Clicked")}
                  className="w-full text-left text-sm text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Change Role (Debug)
                </button>
              )}
              <button
                onClick={() => handleDeleteModeToggle()}
                className="w-full text-left text-sm text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Delete Messages
              </button>
            </div>
          ) : confirmDelete ? (
            <div className="p-3">
              <p className="text-sm">Are you sure you want to delete?</p>
              <div className="flex justify-between mt-3">
                <button onClick={handleConfirmDelete} className="text-white bg-red-500 px-3 py-1 rounded-md">
                  Yes
                </button>
                <button onClick={() => setConfirmDelete(false)} className="text-gray-700 bg-gray-200 px-3 py-1 rounded-md">
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3">
              <p className="text-sm">Click messages to select them</p>
              <button
                onClick={() => setConfirmDelete(true)}
                className={`mt-3 w-full py-1 text-white rounded-md ${selectedMessages.length > 0 ? "bg-red-500 hover:bg-red-600" : "bg-gray-300 cursor-not-allowed"}`}
                disabled={selectedMessages.length === 0}
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* Change Role Modal */}
      {selectedUser && (
        <ChangeRoleModal
          open={isRoleModalOpen}
          setOpen={setIsRoleModalOpen}
          user={selectedUser}
          serverId={serverId}
          updateUserRole={(userId, newRole) => {
            // Handle updating the user's role in UI (if needed)
          }}
        />
      )}
    </>
  );
}