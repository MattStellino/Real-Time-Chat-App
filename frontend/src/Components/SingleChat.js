import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Card} from 'primereact/card';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import { Panel } from 'primereact/panel'
import {InputText} from 'primereact/inputtext';
import {ProgressSpinner} from 'primereact/progressspinner';

import { setSelectedChat } from '../actions/chatActions';
import UpdateGroupChatModal from './misc/UpdateGroupChat';
import ScrollChat from './ScrollChat';
import { getSender, getSenderFull } from '../config/ChatLogics';
import '../styles.css';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const { user, selectedChat } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const toast = useRef(null);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/message/${selectedChat._id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!response.ok) throw new Error('Failed to Load the Messages');

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error Occurred!',
        detail: error.message,
        life: 5000,
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  const sendMessage = async (event) => {
    if (event.key === 'Enter' && newMessage) {
      try {
        setNewMessage('');
        const response = await fetch('http://localhost:5000/api/message', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ content: newMessage, chatId: selectedChat }),
        });

        if (!response.ok) throw new Error('Failed to send the Message');

        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Error Occurred!',
          detail: error.message,
          life: 5000,
          position: 'bottom',
        });
      }
    }
  };

  const typingHandler = (e) => setNewMessage(e.target.value);

  if (!selectedChat) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: '25px' 
        }}
      >
        <p>Please Select a chat to start</p>
      </div>
    );
  }

return (
    <div >
        <div className="chat-header" >
            <Button
                icon="pi pi-arrow-left"
                className="back-button"
                onClick={() => dispatch(setSelectedChat(null))}
                style={{ 
                backgroundColor: 'mediumseagreen',
                border: '1px solid mediumseagreen',
                color: 'black'
              }}
            />
            {!selectedChat.isGroupChat ? (
                <div className='chat-user'>
                    {getSender(user, selectedChat.users)}
                </div>
            ) : (
                <div>
                    {selectedChat.chatName.toUpperCase()}
                    <UpdateGroupChatModal
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                        fetchMessages={fetchMessages}
                    />
                </div>
            )}
        </div>

        <div className="single-chat-container" >
            <Toast ref={toast} />
            <div className="chat-messages-container">
                {loading ? (
                <ProgressSpinner className="loading-spinner" />
                ) : (
                <div className="messages">
                    <ScrollChat messages={messages} />
                </div>
                )}
                <div className="message-input" onKeyDown={sendMessage}>
                <InputText
                    className="input-text"
                    placeholder="Enter a message..."
                    value={newMessage}
                    onChange={typingHandler}
                />
                </div>
            </div>
        </div>
    </div>
  );
};

export default SingleChat;


