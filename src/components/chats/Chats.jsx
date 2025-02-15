import "./Chat.css"
import profilePic from '../ressources/icons8-profile-picture-100.png';
import phonePic from '../ressources/icons8-call-90.png';
import newChat from '../ressources/icons8-create-90.png';
import more from '../ressources/icons8-more-90.png';

function Chat(){

    return(
        <div className="Chat">
            <div className="Top">
                <div className ="User"> 
                    <img src={profilePic} className="profilePic"/>
                    <div className="Text">
                        <span>User Name</span>
                        <p>Description n Description Description Description</p>
                    </div>
                </div>
                <div className = "Logos">
                        <img src={phonePic} className="phonePic"/>
                        <img src={newChat} className="profilePic"/>
                </div>
            </div>
            <div className = "Center"></div>
            <div className = "Bottom"></div>
        </div>
    );
}

export default Chat