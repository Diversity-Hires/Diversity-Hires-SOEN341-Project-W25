import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from '../components/Sidebar.js'
import Chat from '../components/Chat.js'
import { jwtDecode } from 'jwt-decode';
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
import RemoveUser from '../components/Remove_user';
import ChangeRoleModal from '../components/ChangeRoleModal.js'
import { setUserOnline } from '../presence.js'; 
import JoinServer from '../components/JoinServer.js';
import Snek from '../animations/Snek.js';

import Notiflix from 'notiflix';

function Home() {

  const [selectedServer, setSelectedServer] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [allExistingServers, setAllExistingServers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]); // Tracks messages selected for deletion
  const [selectedServerUsers, setSelectedServerUsers] = useState(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false); // For admin deleting messages
  const [serverMode, setServerMode] = useState(true);
  const [joinRequestsForUser , setJoinRequestsForUser] = useState([]);

  const [openCreateServerDialog, setOpenCreateServerDialog] = useState(false);
  const [openJoinServerDialog, setOpenJoinServerDialog] = useState(false);
  const [openCreateDMDialog, setOpenCreateDMDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);  
  const [openRemoveUserDialog, setOpenRemoveUserDialog] = useState(false);
  const [openChangeRoleDialog, setOpenChangeRoleDialog] = useState(false);  
  const [openSnek, setOpenSnek] = useState(false);

  // Get the current user from the token
  const token = localStorage.getItem('token');
  const currentUser = jwtDecode(token).id || '';

  // Set the user's status to online
  useEffect(() => {
    if (currentUser) {
      setUserOnline(currentUser);
    }
  }, [currentUser]);

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

  const handleRemoveUser = () => {
    setOpenRemoveUserDialog(true); 
  };

  const handleChangeRole = () => {
    setOpenChangeRoleDialog(true);
  };

  const handleServerModeToggle = () => {
    setServerMode((prev) => !prev);
    setSelectedServer(null);
  }; 

  const handlePlusMenuForServers = () => {
    Notiflix.Confirm.show(
      'Start chatting now!',
      'Please choose action',
      'Create new server',
      'Join existing server',
      function okCb() {
        handleCreateServer();
      },
      function cancelCb() {
        setOpenJoinServerDialog(true);
      },
      {
        width: '400px',
        titleFontSize: '20px',
        titleColor: '#372aac',
        okButtonColor: '#FFFFFF',
        okButtonBackground: '#4f39f6',
        cancelButtonColor: '#FFFFFF',
        cancelButtonBackground: '#7f22fe',
      }
    );
  }

  const refreshServersAndDMs = () => {
    if (serverMode === true) {
      getServers();
    } else {
      getDMs();
    }
  };

  const handleMessageSelect = (id) => {
    if (id) {
      setSelectedMessages((prev) => {
        const newSelection = new Set(prev);
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
        return Array.from(newSelection);
      });
    } else {
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
  const analytics = getAnalytics(app);

  // Fetch messages when a server is selected
  useEffect(() => {
    if (!selectedServer) {
      setMessages([]);
      setSelectedServerUsers(null);
      return;
    }
    getMessagesForServer();
    getJoinRequestsForUser();
    
    // Set up a realtime listener for the server's users
    const db = getDatabase();
    const usersRef = ref(db, `servers/${selectedServer.id}/users`);
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((child) => {
          users.push({
            username: child.key,
            role: child.val(),
          });
        });
        setSelectedServerUsers(users);
      } else {
        setSelectedServerUsers([]);
      }
    }, (error) => {
      console.error('Error fetching server users:', error);
      setSelectedServerUsers([]);
    });
    return () => {
      unsubscribe();
    };
  }, [selectedServer]);

  useEffect(() => {
    if (currentUser) {
      if (serverMode === true) {
        getServers();
      } else {
        getDMs();
      }
      getUsers();
    }
  }, [currentUser, serverMode]);



  function isAdmin(user) {
    if (!selectedServerUsers || !user) return false;
    const found = selectedServerUsers.find((u) => u.username === user);
    return found?.role === 'admin';
  }

  // Function to fetch messages from Realtime DB
  function getMessagesForServer() {
    const db = getDatabase();
    const messagesRef = serverMode
      ? ref(db, `servers/${selectedServer.id}/messages`)
      : ref(db, `directmessages/${selectedServer.id}/messages`);
  
    off(messagesRef);
  
    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedMessages = Object.entries(data).map(([key, msg]) => ({
          id: key,
          ...msg,
        }));
        loadedMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    });
    //console.log(messages);
  }

  // Function to get the list of servers for the user
  function getServers() {
    const db = getDatabase();
    const serversRef = ref(db, `servers`);
  
    get(serversRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const serverKeys = Object.keys(data);
          const serversArray = [];
  
          serverKeys.forEach((serverId) => {
            const serverData = data[serverId];
            if (serverData.users && serverData.users[currentUser]) {
              serversArray.push({
                id: serverId,
                name: serverData.name || 'Unnamed Server',
              });
            }
          });
  
          setUserServers(serversArray);
          console.log('Servers array:', serversArray);
          getAllExistingServers();
        } else {
          setUserServers([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching servers:', error);
      });
  }

   // Function to get the list of all servers
  function getAllExistingServers() {
    const db = getDatabase();
    const serversRef = ref(db, `servers`);
  
    get(serversRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const serverKeys = Object.keys(data);
        const serversArray = [];

        serverKeys.forEach((serverId) => {
          const serverData = data[serverId];
          serversArray.push({
            id: serverId,
            name: serverData.name || 'Unnamed Server',
          });
        });
  
        setAllExistingServers(serversArray);
        //console.log('Servers array:', serversArray);
      } else {
        setAllExistingServers([]);
      }
    })
    .catch((error) => {
      console.error('Error fetching servers:', error);
    });
  }


  // Function to fetch join requests for the servers the user is an admin of
  function getJoinRequestsForUser() {
    const db = getDatabase();
    // We'll store requests by server so if multiple servers update, we combine them.
    const requestsByServer = {};

    userServers.forEach((server) => {
      // Fetch the array of users and roles for this server
      if(serverMode){
        getServerUsers(server.id).then((serverUsers) => {
          // Check if currentUser is admin for this server (similar to isAdmin logic)
          const isUserAdmin = serverUsers.some((u) => u.username === currentUser && u.role === 'admin');
          if (isUserAdmin) {
            // Listen for changes in real-time to the requests for this server.
            const requestsRef = ref(db, `servers/${server.id}/requests`);
            // Detach any existing listeners for this path to avoid duplication.
            off(requestsRef);

            onValue(requestsRef, (snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.val();
                // Transform the request objects into an array including all required info.
                const requestsArray = Object.entries(data).map(([key, requestData]) => ({
                  username: key,
                  timestamp: requestData.timestamp || 0,
                  serverName: server.name,
                  serverId: server.id
                }));
                // Store requests for this server.
                requestsByServer[server.id] = requestsArray;
              } else {
                // No requests for this server.
                requestsByServer[server.id] = [];
              }

              // Combine all requests from the servers where user is admin.
              const allRequests = Object.values(requestsByServer).flat();
              // Update the state with these combined requests.
              console.log("Requests for "+currentUser+": ",allRequests);
              setJoinRequestsForUser(allRequests);
            });
          } else {
            // If not admin, ensure we clear out any previous data for this server.
            requestsByServer[server.id] = [];
          }
        }).catch((err) => {
          console.error(`Error fetching users for server ${server.id}:`, err);
        });
      }
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
          }
        });
        return firstValidName || '';
      } else {
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
        const dmPromises = dmKeys.map((dmId) => {
          const dmData = data[dmId];
          if (dmData.users && dmData.users[currentUser]) {
            return DmNameHelper(dmId).then((dmName) => {
              return {
                id: dmId,
                name: dmName || 'Unnamed'
              };
            });
          }
          return null;
        });
        return Promise.all(dmPromises);
      })
      .then((dmEntries) => {
        const dmsArray = dmEntries.filter((item) => item !== null);
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
          snapshot.forEach((child) => {
            users.push(child.key);
          });
          setUserList(users);
        } else {
          setUserList([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setUserList([]);
      });
  }
  
  // Function to update the list of the members and admins of the current server
  function updateServerUsers() {
    const db = getDatabase();
    const usersRef = ref(db, `servers/${selectedServer.id}/users`);
    get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users = [];
          snapshot.forEach((child) => {
            users.push({
              username: child.key,
              role: child.val()
            });
          });
          setSelectedServerUsers(users);
        } else {
          setSelectedServerUsers(null);
        }
      })
      .catch((error) => {
        console.error('Error updating users for this server:', error);
        setSelectedServerUsers(null);
      });
  }


  // Function to get the list of the members and admins of a server
  function getServerUsers(serverId) {
    const db = getDatabase();
    const usersRef = ref(db, `servers/${serverId}/users`);
    return get(usersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users = [];
          snapshot.forEach((child) => {
            users.push({
              username: child.key,
              role: child.val()
            });
          });
          return users;
        }
      })
      .catch((error) => {
        console.error('Error fetching users for this server:', error);
        return [];
      });
  }


  
  return(
    <div className="flex flex-col min-h-screen">
      <Navbar 
        user={currentUser}
        serverMode={serverMode}
        toggleServerMode={handleServerModeToggle}
        setOpenSnek={setOpenSnek}
        joinRequestsForUser={joinRequestsForUser}
        getRequests={getJoinRequestsForUser}
      />
  
      <div className="flex flex-1 overflow-hidden">
  
        <Sidebar 
          serverMode={serverMode}
          servers={userServers} 
          setSelectedServer={setSelectedServer}
          openPlusMenu={serverMode ? handlePlusMenuForServers : handleCreateDM} 
          selectedServer={selectedServer}
          className="w-64 min-w-32 flex-shrink-0" 
        />
  
        <div className="flex-1 flex flex-col overflow-hidden">
          <Chat
            messages={messages}
            selectedServer={selectedServer}
            openAddUser={handleAddUser}
            openRemoveUser={handleRemoveUser}
            openChangeRole={handleChangeRole}
            isAdmin={isAdmin(currentUser)}  
            handleMessageSelect={handleMessageSelect}
            selectedMessages={selectedMessages}
            isDeleteMode={isDeleteMode}
            handleDeleteModeToggle={handleDeleteModeToggle}
            serverMode={serverMode}
            currentUser={currentUser}
            refresh={refreshServersAndDMs}
            className="flex-1 overflow-auto"
          />
        </div>
        
      </div>
  
      {/* Dialogs */}
      <CreateServerPopUp
        open={openCreateServerDialog}
        setOpen={setOpenCreateServerDialog}
        currentUser={currentUser}
        userList={userList}
        refresh={refreshServersAndDMs}
      />
      
      <CreateDM
        open={openCreateDMDialog}
        setOpen={setOpenCreateDMDialog}
        currentUser={currentUser}
        userList={userList}
        refresh={refreshServersAndDMs}
        currentDMs={userServers}
      />

      <JoinServer
        open={openJoinServerDialog}
        setOpen={setOpenJoinServerDialog}
        servers={allExistingServers}
        currentServers={userServers}
        currentUser={currentUser}
        refresh={refreshServersAndDMs}
      />
  
      <AddUserPopUp
        open={openAddUserDialog}
        setOpen={setOpenAddUserDialog}
        serverId={selectedServer?.id || ""}
        userList={userList}
        serverUsers={selectedServerUsers}
        updateUserList={updateServerUsers}
      />
  
      <RemoveUser
        open={openRemoveUserDialog}
        setOpen={setOpenRemoveUserDialog}
        serverId={selectedServer?.id || ""}
        serverUsers={selectedServerUsers}
        updateUserList={updateServerUsers}
      />
  
      <ChangeRoleModal
        open={openChangeRoleDialog}
        setOpen={setOpenChangeRoleDialog}
        serverId={selectedServer?.id || ""}
        serverUsers={selectedServerUsers}
        getUpdatedRoles={updateServerUsers}
      />

      <Snek
        open={openSnek}
        setOpen={setOpenSnek}
      />

    </div>
  );
}

export default Home;