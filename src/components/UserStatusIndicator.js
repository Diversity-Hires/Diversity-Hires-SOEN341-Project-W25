// src/components/UserStatusIndicator.js
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export default function UserStatusIndicator({
  username,
  onPresenceChange, // a callback
  hideDot = false   // optionally hide the dot if needed
}) {
  const [status, setStatus] = useState('offline');

  useEffect(() => {
    const db = getDatabase();
    const statusRef = ref(db, `status/${username}`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      let newStatus = 'offline';
      let newLastChanged = null;

      if (data && data.state) {
        newStatus = data.state;
        newLastChanged = data.lastChanged;
      }
      setStatus(newStatus);

      // If a callback is provided, send the presence data upward
      if (typeof onPresenceChange === 'function') {
        onPresenceChange(newStatus, newLastChanged);
      }
    });

    return () => unsubscribe();
  }, [username, onPresenceChange]);

  // Determine dot color
  const dotColor =
    status === 'online'
      ? 'bg-green-500'
      : status === 'away'
      ? 'bg-yellow-500'
      : 'bg-gray-500';

  // If we do want to show the dot, do so; otherwise, we render nothing.
  return !hideDot ? (
    <span
      className={`inline-block w-2 h-2 rounded-full ${dotColor}`}
      title={status}
    />
  ) : null;
}