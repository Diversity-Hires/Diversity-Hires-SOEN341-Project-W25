import React, { useState, useRef, useEffect } from "react";

export default function Dropdown({ open, setOpen, buttonRef, onActionSelect }) {
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false); // Close the dropdown when clicking outside
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside); // Cleanup listener
  }, [setOpen, buttonRef]);

  useEffect(() => {
    if (open && buttonRef.current && dropdownRef.current) {
      // Calculate dropdown position based on button's position
      const buttonRect = buttonRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = `${buttonRect.bottom + window.scrollY + 5}px`; // 5px below the button
      dropdownRef.current.style.left = `${buttonRect.left + window.scrollX}px`; // Align to the left of the button
    }
  }, [open, buttonRef]);

  const handleActionClick = (action) => {
    onActionSelect(action); // Pass selected action to the parent
    setOpen(false); // Close dropdown after selecting an action
  };

  return (
    open && (
      <div
        ref={dropdownRef}
        className=" bg-white shadow-lg rounded-md w-48 p-3 mt-2"
        style={{
          zIndex: 1000,
          pointerEvents: "auto", // Ensure dropdown can receive interactions
        }}
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
    )
  );
}

