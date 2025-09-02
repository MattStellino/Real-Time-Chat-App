import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import Header from './Header';
import MessageList from './MessageList';
import Composer from './Composer';
import ChatDetails from './ChatDetails';
import { resetSelectedChat } from '../actions/chatActions';

const ChatPane = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  // If no chat is selected, show empty state
  if (!selectedChat) {
    return (
      <div className="chat-pane">
        <div className="chat-empty-state">
          <div className="chat-empty-icon">💬</div>
          <h2>Select a chat to start messaging</h2>
          <p>Choose a conversation from the sidebar or search for a user to begin chatting</p>
        </div>
      </div>
    );
  }

  // Chat is selected - render full conversation pane
  return (
    <div className="chat-pane" key={selectedChat._id}>
      <div className="chat-pane__header">
        <Header />
        <Button 
          icon="pi pi-times" 
          className="clear-chat-button"
          onClick={() => dispatch(resetSelectedChat())}
          aria-label="Clear selected chat"
          title="Clear selected chat"
        />
      </div>
      <div className="chat-pane__messages">
        <MessageList 
          fetchAgain={fetchAgain} 
          setFetchAgain={setFetchAgain} 
        />
      </div>
      <div className="chat-pane__composer">
        <Composer onMessageSent={() => setFetchAgain(!fetchAgain)} />
      </div>
      <ChatDetails />
    </div>
  );
};

export default ChatPane;
