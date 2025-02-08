import ChatList from './ChatList/ChatList';
import './SideBar.css'
import UserInfo from './UserInfo/UserInfo';


function SideBar()
{
    return(
        <div className='side'>
            <UserInfo/>
            <ChatList/>
        </div>
    );
}

export default SideBar