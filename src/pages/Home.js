import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SideBar from './Components/sideBar/SideBar.jsx'  
import Chat from './Components/chats/Chats.jsx'
import Details from './Components/details/Details.jsx'

function App() {
  return(
    <div className = "Container">
      
        <SideBar/>
        <Chat/>
        <Details/>
    </div>
  );
}

export default App
