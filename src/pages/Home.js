import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from '../components/Sidebar.js'
import Chat from '../components/Chat.js'
//import Details from '../components/details/Details.jsx'
import Navbar from '../components/Navbar.js'
import {jwtDecode} from 'jwt-decode';

// imports for front-end access to Firebase DB
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, get, onValue, off } from 'firebase/database';
import CreateServerPopUp from '../components/CreateGroup';
import AddUserPopUp from '../components/Add_user'



function Home() {

  const [selectedServer, setSelectedServer] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);
  const [selectedServerUsers, setSelectedServerUsers] = useState(null);
  const [openCreateServerDialog, setOpenCreateServerDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);  

  const token = localStorage.getItem('token');
  const currentUser = jwtDecode(token).id || '';

  const handleCreateServer = () => {
    setOpenCreateServerDialog(true);
  };

  const handleAddUser = () => {
    
    setOpenAddUserDialog(true);
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
      getServers();
      getUsers();
    }
  }, [currentUser]);


  function isAdmin() {
    // If we haven't loaded the server users yet, or currentUser doesn't exist, default to false
    if (!selectedServerUsers || !currentUser) return false;
  
    // Try to find the currentUser in selectedServerUsers
    const found = selectedServerUsers.find(
      (u) => u.username === currentUser
    );
  
    // Return true if found user's role is 'admin'
    return found?.role === 'admin';
  }

  
  // Function to fetch messages from Realtime DB
  function getMessagesForServer() {
    const db = getDatabase();
    const messagesRef = ref(db, `servers/${selectedServer.id}/messages`);

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
  }


// Function to get the list of servers for the user
  function getServers() {
    const db = getDatabase();
    const serversRef = ref(db, `users/${currentUser}/servers`);
  
    get(serversRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val(); // e.g., { 165: "Server Name A", 456: "Server Name B" }
          
          // Convert to array of { id, name } objects
          const serversArray = Object.entries(data).map(([id, name]) => ({ 
            id, 
            name 
          }));
          
          setUserServers(serversArray);
        } else {
          setUserServers([]); // no servers yet
        }
      })
      .catch((error) => {
        console.error('Error fetching servers:', error);
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
      />

      <div className="flex flex-1 overflow-hidden">

        <Sidebar 
        servers={userServers} 
        setSelectedServer={setSelectedServer}
        openCreateServer={handleCreateServer}
        className="w-64 min-w-32 flex-shrink-0" 
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Chat
            messages={messages}
            selectedServer={selectedServer}
            openAddUser={handleAddUser}
            isAdmin={isAdmin()}  
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
            />
      
      <AddUserPopUp
              open={openAddUserDialog}
              setOpen = {setOpenAddUserDialog}
              serverId={selectedServer?.id || ""}
              userList = {userList}
              serverUsers = {selectedServerUsers}
            />
    </div>
  );

}

export default Home