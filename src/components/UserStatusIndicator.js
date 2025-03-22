// src/components/UserStatusIndicator.js
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export default function UserStatusIndicator({ username }) {
  const [status, setStatus] = useState('offline');

  useEffect(() => {
    const db = getDatabase();
    const statusRef = ref(db, `status/${username}`);
    
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.state) {
        setStatus(data.state);
      } else {
        setStatus('offline');
      }
    });
    
    return () => unsubscribe();
  }, [username]);

  const dotColor = status === 'online' ? 'bg-green-500' : (status === 'away' ? 'bg-yellow-500' : 'bg-gray-500');

  return <span className={`inline-block w-2 h-2 rounded-full ${dotColor} mr-1`} title={status} />;
}