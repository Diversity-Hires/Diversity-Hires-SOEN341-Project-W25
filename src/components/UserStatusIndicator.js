// src/components/UserStatusIndicator.js
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import {isUserAway} from '../presence';

export default function UserStatusIndicator({
  username,
  onPresenceChange, // a callback for presence status
  onAwayChange,
  hideDot = false   // optionally hide the dot if needed
}) {
  const [status, setStatus] = useState('offline');
  const [away, setAway] = useState(false);

  // Set isAway to the away status of the user
  useEffect(() => {
    const db = getDatabase();
    const statusRef = ref(db, `status/${username}`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      let newStatus = false;

      if (data && data.away) {
        newStatus = data.away;      }
      setAway(newStatus);

      // If a callback is provided, send the presence data upward
      if (typeof onAwayChange === 'function') {
        onAwayChange(newStatus);
      }
    });

    return () => unsubscribe();
  }, [username, onAwayChange]);

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
  away === true
    ? 'bg-yellow-500'
    : (status === 'online' ? 'bg-green-500' : 'bg-gray-500');

  // If we do want to show the dot, do so; otherwise, we render nothing.
  return !hideDot ? (
    <span
      className={`inline-block w-2 h-2 rounded-full ${dotColor}`}
      title={status}
    />
  ) : null;
}