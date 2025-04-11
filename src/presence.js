import { getDatabase, ref, set, get, update, onDisconnect, serverTimestamp } from 'firebase/database';


export async function isUserAway(username){
  const db = getDatabase();
  const stateRef = ref(db, `status/${username}/away`);

  try {
    const stateSnapshot = await get(stateRef);
    if (stateSnapshot.exists()) {
      const currentState = stateSnapshot.val();
      //console.log(currentState);
      return currentState; // returns true/false
    } else {
      console.log('No data available');
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
  
}


export async function setUserOnline(username) {
  const db = getDatabase();
  const userStatusRef = ref(db, `status/${username}`);

  // Set online with a client timestamp
  update(userStatusRef, { state: 'online', lastChanged: Date.now() });
  // Schedule onDisconnect update (for unexpected disconnects)
  onDisconnect(userStatusRef).update({ state: 'offline', lastChanged: serverTimestamp() });
  
  return;
}

export async function setUserOffline(username) {
  const db = getDatabase();
  const userStatusRef = ref(db, `status/${username}`);

  // Explicitly update to offline with the current time
  update(userStatusRef, { state: 'offline', lastChanged: Date.now() });
  
  return;
}


export async function toggleUserAway(username) {
  const db = getDatabase();
  const userStatusRef = ref(db, `status/${username}`);
  const away = await isUserAway(username);

   if (!away){
    // Toggle status to Away
    update(userStatusRef, { away: true, lastChanged: Date.now() });
  } else {
    // Toggle status to Online
    update(userStatusRef, { away: false, lastChanged: Date.now() });
  }

  return; // no need to proceed further
  

}