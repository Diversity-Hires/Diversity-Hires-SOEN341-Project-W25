import { useState } from 'react'
import './App.css'
import Sidebar from '../components/Sidebar.js'
import Chat from '../components/Chat.js'
import Details from '../components/details/Details.jsx'
import Navbar from '../components/Navbar.js'

function Home() {

  const [selectedServer, setSelectedServer] = useState(null);
  const [messages, setMessages] = useState([]);

  const servers = [
    { id: "1", name: "Gaming Server" },
    { id: "2", name: "Coding Hub" },
    { id: "3", name: "Music Lounge" }
  ];

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

  return(
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        <Sidebar 
        servers={servers} 
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