import { getDatabase, ref, set, onDisconnect, serverTimestamp } from 'firebase/database';

export function setUserOnline(username) {
  const db = getDatabase();
  const userStatusRef = ref(db, `status/${username}`);
  // Set online with a client timestamp
  set(userStatusRef, { state: 'online', lastChanged: Date.now() });
  // Schedule onDisconnect update (for unexpected disconnects)
  onDisconnect(userStatusRef).set({ state: 'offline', lastChanged: serverTimestamp() });
}

export function setUserOffline(username) {
  const db = getDatabase();
  const userStatusRef = ref(db, `status/${username}`);
  // Explicitly update to offline with the current time
  return set(userStatusRef, { state: 'offline', lastChanged: Date.now() });
}