import { useState } from 'react'
import './App.css'
import SideBar from '../components/sideBar/SideBar.jsx'
import Chat from '../components/chats/Chats.jsx'
import Details from '../components/details/Details.jsx'

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