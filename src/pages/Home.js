import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from '../components/Sidebar.js'
import Chat from '../components/Chat.js'
import Details from '../components/details/Details.jsx'
import Navbar from '../components/Navbar.js'
import {jwtDecode} from 'jwt-decode';

// imports for front-end access to Firebase DB
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, get } from 'firebase/database';


function Home() {

  const [selectedServer, setSelectedServer] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem('token');

  const currentUser = jwtDecode(token).id || '';

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

  // Fetch messages when a server is selected
  // useEffect(() => {
  //   if (!selectedServer) return;

  //   const messagesRef = collection(db, `servers/${selectedServer.id}/messages`);
  //   const q = query(messagesRef, orderBy('timestamp', 'asc'));

  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const fetchedMessages = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data()
  //     }));
  //     setMessages(fetchedMessages);
  //   });

  //   return () => unsubscribe(); // Clean up listener
  // }, [selectedServer]);

  useEffect(() => {
    if (currentUser) {
      getServers();
    }
  }, [currentUser]);


  function getServers() {
    const db = getDatabase();
    const serversRef = ref(db, `users/${currentUser}/servers`);
  
    get(serversRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val(); // e.g., { abc123: "Server Name A", xyz789: "Server Name B" }
          
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

 

  return(
    <div className="flex flex-col min-h-screen">
      <Navbar 
      user = {currentUser}
      />

      <div className="flex flex-1 overflow-hidden">

        <Sidebar 
        servers={userServers} 
        className="w-64 min-w-32 flex-shrink-0" 
        />

        <div className="flex-1 flex flex-col overflow-hidden">

          <Chat className="flex-1 overflow-auto" />

        </div>
        
      </div>
    </div>
  );

}

export default Home