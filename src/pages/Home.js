import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from '../components/Sidebar.js'
import Chat from '../components/Chat.js'
//import Details from '../components/details/Details.jsx'
import {jwtDecode} from 'jwt-decode';
import { waitFor } from '@testing-library/react'

// imports for front-end access to Firebase DB
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, get, onValue, off } from 'firebase/database';

//import components
import Navbar from '../components/Navbar.js'
import CreateServerPopUp from '../components/CreateGroup';
import CreateDM from '../components/CreateDM.js';
import AddUserPopUp from '../components/Add_user';
import ChangeRoleModal from '../components/ChangeRoleModal.js'




function Home() {

  const [selectedServer, setSelectedServer] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);//This array keeps track of selected messages to be deleted
  const [selectedServerUsers, setSelectedServerUsers] = useState(null);
  const [openCreateServerDialog, setOpenCreateServerDialog] = useState(false);
  const [openCreateDMDialog, setOpenCreateDMDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);  
  const [openChangeRoleDialog, setOpenChangeRoleDialog] = useState(false);  
  const [isDeleteMode, setIsDeleteMode] = useState(false); //This keeps track of delete mode when admin deletes messages
  const [serverMode, setServerMode] = useState(true);

  const token = localStorage.getItem('token');
  const currentUser = jwtDecode(token).id || '';

  const handleCreateServer = () => {
    setOpenCreateServerDialog(true);
  };

  const handleCreateDM = () => {
    setOpenCreateDMDialog(true);
  };

  const handleDeleteModeToggle = () => {
    setIsDeleteMode((prev) => !prev);
  }; 

  const handleAddUser = () => {
    setOpenAddUserDialog(true);
  };

  const handleChangeRole = () => {
    setOpenChangeRoleDialog(true);
  };

  const handleServerModeToggle = () => {
    setServerMode((prev) => !prev);
  }; 

  const refreshServersAndDMs = () => {
      if(serverMode === true){
      getServers();}
      else{
      getDMs();
      }
    };

  
  const handleMessageSelect = (id) => {
    if(id){
      setSelectedMessages((prev) => {
        const newSelection = new Set(prev);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
        return Array.from(newSelection);
      });
    }
    else if (!id) {
      setSelectedMessages([]);
    }
    
  };
  

  // Configure firebase connection
  const firebaseConfig = {
    apiKey: "AIzaSyCK3SV2WKNAEB9OdXqd5fee6K0tUjYsw4w",
    authDomain: "chathaven-3b77a.firebaseapp.com",
    databaseURL: "https://chathaven-3b77a-default-rtdb.firebaseio.com",
    projectId: "chathaven-3b77a",
    storageBucket: "chathaven-3b77a.firebasestorage.app",
    messagingSenderId: "881824192229",
    appId: "1:881824192229:web:3a68105be061f49432e60c",
    measurementId: "G-6VMPWLPHQH"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app)


  //Fetch messages when a server is selected
  useEffect(() => {
    if (!selectedServer) {
      setMessages([]);
      setSelectedServerUsers(null);
      return;
    }
    getMessagesForServer();
    getServerUsers();
  }, [selectedServer]);


  useEffect(() => {
    if (currentUser) {
      //console.log("Server mode: ", serverMode);
      if(serverMode === true){
      getServers();}
      else{
      getDMs();
      }
      getUsers();
    }
  }, [currentUser, serverMode]);



  function isAdmin(user) {
    // If we haven't loaded the server users yet, or currentUser doesn't exist, default to false
    if (!selectedServerUsers || !user) return false;
  
    // Try to find the currentUser in selectedServerUsers
    const found = selectedServerUsers.find(
      (u) => u.username === user
    );
  
    // Return true if found user's role is 'admin'
    return found?.role === 'admin';
  }

  
  // Function to fetch messages from Realtime DB
  function getMessagesForServer() {
    const db = getDatabase();
    const messagesRef = serverMode
    ? ref(db, `servers/${selectedServer.id}/messages`)
    : ref(db, `directmessages/${selectedServer.id}/messages`);

    // Turn off any old listener first, to avoid duplicates if selectedServer changes
    off(messagesRef);

    // Real-time listener for this server's messages
    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val(); // { msgKey1: {...}, msgKey2: {...} }
        // Convert to an array
        const loadedMessages = Object.entries(data).map(([key, msg]) => ({
          id: key,
          ...msg,
          
        }));
        // Sort by timestamp ascending if you want chronological order
        loadedMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    });
    console.log(messages);
  }



  // Function to get the list of servers for the user
  function getServers() {
    const db = getDatabase();
    const serversRef = ref(db, `servers`);

    get(serversRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val(); // e.g., { 165: "Server Name A", 456: "Server Name B" }
          const serverKeys = Object.keys(data);
          

          // We'll store the servers the user belongs to in this array
          const serversArray = [];

          // Iterate through each server
          serverKeys.forEach((serverId) => {
            const serverData = data[serverId];

            // Check if there's a 'users' property and if it includes the currentUserId
            if (serverData.users && serverData.users[currentUser]) {
              // Add server to the array
              serversArray.push({
                id: serverId,
                name: serverData.name || 'Unnamed Server',
                // add any other server info if needed
              });
            }
          });

          setUserServers(serversArray);
          console.log('Servers array:',serversArray);
        } else {
          setUserServers([]); // no servers yet
        }
      })
      .catch((error) => {
        console.error('Error fetching servers:', error);
      });
  }



  async function DmNameHelper(DmID) {
    const db = getDatabase();
    const usersRef = ref(db, `directmessages/${DmID}/users`);
  
    try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        let firstValidName = null;
  
        snapshot.forEach((childSnapshot) => {
          const username = childSnapshot.key;
          if (username !== currentUser) {
            firstValidName = username;
            // We don't break the forEach in Firebase snapshot iteration
            // but once a name is found, it’s effectively the “first valid” one.
          }
        });
  
        // Return the first valid name or empty string
        return firstValidName || '';
      } else {
        // No snapshot found
        return '';
      }
    } catch (error) {
      console.error('Error fetching users for this server:', error);
      return '';
    }
  }


  function getDMs() {
    const db = getDatabase();
    const dmsRef = ref(db, 'directmessages');
  
    get(dmsRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          setUserServers([]);
          return;
        }
        const data = snapshot.val();
        const dmKeys = Object.keys(data);
  
        // We'll transform each dmId into a promise that resolves with the DM object
        const dmPromises = dmKeys.map((dmId) => {
          const dmData = data[dmId];
  
          // If the current user is part of this DM's users
          if (dmData.users && dmData.users[currentUser]) {
            // Call DmNameHelper, which returns a promise for the other user's name
            return DmNameHelper(dmId).then((dmName) => {
              return {
                id: dmId,
                name: dmName || 'Unnamed'
              };
            });
          }
          // If the user is not part of this DM, return null so we can filter it out
          return null;
        });
  
        // Resolve all DmNameHelper calls before updating your state/array
        return Promise.all(dmPromises);
      })
      .then((dmEntries) => {
        // Filter out null entries from DMs that don't include currentUser
        const dmsArray = dmEntries.filter((item) => item !== null);
  
        // Now update your state or do what you need with the array
        setUserServers(dmsArray);
        console.log('DM array:', dmsArray);
      })
      .catch((error) => {
        console.error('Error fetching direct messages:', error);
      });
  }
  


  // Function to get the list of all users
  function getUsers() {
    const db = getDatabase();
    const usersRef = ref(db, 'users');

    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users = [];
          
          // iterate over all users and add to array
          snapshot.forEach((child) => {
            users.push(child.key);
          });
          
          setUserList(users);
        }else{
          setUserList([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setUserList([]);
      });
  }



  // Function to get the list of the members and admins of current selected server
  function getServerUsers() {
    const db = getDatabase();
    const usersRef = ref(db, `servers/${selectedServer.id}/users`);

    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users = [];
          
          // iterate over all users and add to array
          snapshot.forEach((child) => {
            users.push({
              username: child.key, // username
              role: child.val()    // role
            });
          });
          
          setSelectedServerUsers(users);
        }else{
          setSelectedServerUsers(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching users for this server:', error);
        setSelectedServerUsers(null);
      });
  }
 

  return(
    <div className="flex flex-col min-h-screen">
      <Navbar 
      user = {currentUser}
      serverMode = {serverMode}
      toggleServerMode = {handleServerModeToggle}
      />

      <div className="flex flex-1 overflow-hidden">

        <Sidebar 
        servers={userServers} 
        setSelectedServer={setSelectedServer}
        openCreateServerOrDM={serverMode ? handleCreateServer : handleCreateDM} 
        selectedServer={selectedServer}
        className="w-64 min-w-32 flex-shrink-0" 
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Chat
            messages={messages}
            selectedServer={selectedServer}
            openAddUser={handleAddUser}
            openChangeRole={handleChangeRole}
            isAdmin={isAdmin(currentUser)}  
            handleMessageSelect={handleMessageSelect}
            selectedMessages={selectedMessages}
            isDeleteMode = {isDeleteMode}
            handleDeleteModeToggle = {handleDeleteModeToggle}
            serverMode = {serverMode}

            className="flex-1 overflow-auto"
            
          />
        </div>
        
      </div>

      {/* Dialogs */}
      <CreateServerPopUp
              open={openCreateServerDialog}
              setOpen = {setOpenCreateServerDialog}
              currentUser={currentUser}
              userList = {userList}
              refresh = {refreshServersAndDMs}
            />
      
      <CreateDM
              open={openCreateDMDialog}
              setOpen = {setOpenCreateDMDialog}
              currentUser={currentUser}
              userList = {userList}
              refresh = {refreshServersAndDMs}
              currentDMs = {userServers}
            />

      <AddUserPopUp
              open={openAddUserDialog}
              setOpen = {setOpenAddUserDialog}
              serverId={selectedServer?.id || ""}
              userList = {userList}
              serverUsers = {selectedServerUsers}
            />

      <ChangeRoleModal
              open={openChangeRoleDialog}
              setOpen = {setOpenChangeRoleDialog}
              serverId={selectedServer?.id || ""}
              serverUsers = {selectedServerUsers}
              getUpdatedRoles = {getServerUsers}
            />



    </div>
  );

}

export default Home