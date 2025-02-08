import './ChatList.css'
import Search from '../../ressources/icons8-search-50.png';
import Add from '../../ressources/icons8-add-100.png';
import Minus from '../../ressources/icons8-minus-100.png';
import { useState } from 'react';


function ChatList(){
    const[add, setAdd] = useState(false);
    return (
    <div className = "ChatList">
       <div className = "Research">
        <div className="Bar">
            <img src={Search}/>
            <input type="text" placeholder='Search'/> 
        </div>
        <img src={add  ? Minus : Add}
        onClick={()=> setAdd((prev)=>!prev)}
        />
       </div> 
    </div>
    );
}

export default ChatList