import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import { setSelectedChat, setChats, selectedUser, resetSelectedChat } from '../actions/chatActions';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './misc/GroupChatModal';
import '../styles.css';


const MyChats = () => {
  const [loggedUser, setLoggedUser] = useState();
  const dispatch = useDispatch();
  const { user, chats, selectedChat } = useSelector((state) => state.chat);
  

  const fetchChats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (!response.ok) throw new Error('Failed to load the chats');

      const data = await response.json();
      dispatch(setChats(data));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    console.log("UserInfo from localStorage:", userInfo);
    if (userInfo) {
      setLoggedUser(JSON.parse(userInfo));
    } else {
      console.log("No user info found in localStorage");
    }
    fetchChats();
    dispatch(resetSelectedChat());
  }, [dispatch]);


  useEffect(() => {
  }, [loggedUser]);

  const ChatItem = ({ selectedUser, chat, setSelectedChat, selectedChat, loggedUser }) => {
    const isSelected = selectedChat?._id === chat._id;

    const chatItemStyle = {
      cursor: 'pointer',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '1em',
      width: '50%',
      backgroundColor: isSelected ? 'mediumseagreen' : 'transparent'
    };

    

    return (
      <div onClick={() => setSelectedChat(chat)} style={chatItemStyle} key={chat._id}>
        <h2>
          {!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName}
        </h2>
        <p>{chat.latestMessage ? chat.latestMessage.content : 'No messages'}</p>
      </div>
      
    );
  };

  return (
    <div style={{ color: 'black', fontFamily: 'Monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center'}}>
        <h1 style={{ flex: 1, padding: '1em' }}>My Chats</h1>
        <GroupChatModal>
          <Button style={{ 
            color: 'black',
            backgroundColor: 'mediumseagreen',
            border: '1px solid mediumseagreen',
          }}>
            New Group Chat
          </Button>
        </GroupChatModal>
      </div>
      
      <ScrollPanel style={{  height: '60vh'}}>
        <div>
          {chats && chats.map(chat => (
            <ChatItem 
              key={chat._id}
              chat={chat}
              loggedUser={loggedUser}
              setSelectedChat={(chat) => dispatch(setSelectedChat(chat))}
              selectedChat={selectedChat}
              setSelectedUser={(user) => dispatch(selectedUser(user))}
            />
          ))}
        </div>
      </ScrollPanel>
    </div>
  );
};

export default MyChats;
