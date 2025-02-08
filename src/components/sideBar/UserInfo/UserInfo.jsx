import './UserInfo.css';
import profilePic from '../../ressources/icons8-profile-picture-100.png';
import phonePic from '../../ressources/icons8-call-90.png';
import newChat from '../../ressources/icons8-create-90.png';
import more from '../../ressources/icons8-more-90.png';
function UserInfo(){


    return(
        <><hr/>
        <div className = 'userInfo'>
            <div className = "Profile">
                <img src = {profilePic}/>
                 <h3>Profile Name</h3> 
            </div>

            <div className = "Logos">
                <img src ={phonePic}/>
                <img src ={more}/>
                <img src ={newChat}/>
            </div>
        </div>
        <hr/>
        </>
    ); 
}

export default UserInfo