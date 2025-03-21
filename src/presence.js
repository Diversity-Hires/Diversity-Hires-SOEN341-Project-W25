// src/firebase/presence.js
import { getDatabase, ref, set, onDisconnect } from 'firebase/database';

export function setUserOnline(username) {
  const db = getDatabase();
  const userStatusRef = ref(db, `status/${username}`);

  // Set the user as online with a timestamp
  set(userStatusRef, { state: 'online', lastChanged: Date.now() });

  // On disconnect, mark the user as offline
  onDisconnect(userStatusRef).set({ state: 'offline', lastChanged: Date.now() });
}

// Optional: Function to set user as "away"
// You can call this function after detecting user inactivity.
export function setUserAway(username) {
  const db = getDatabase();
  const userStatusRef = ref(db, `status/${username}`);
  set(userStatusRef, { state: 'away', lastChanged: Date.now() });
}