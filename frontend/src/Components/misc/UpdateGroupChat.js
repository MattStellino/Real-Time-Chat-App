import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Chip } from 'primereact/chip';
import UserListItem from '../../userItems/UserListItem';
import { updateChat, addChatUser, removeChatUser } from '../../actions/chatActions';



const UpdateGroupChatModal = ({fetchAgain, setFetchAgain, fetchMessages}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [groupChatName, setGroupChatName] = useState('');
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { user, selectedChat } = useSelector(state => state.chat);
  const toast = useRef(null);

  const onOpen = () => setIsVisible(true);
  const onClose = () => setIsVisible(false);

  const handleRename = async () => {
  if (!groupChatName) return;

  try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/rename`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        chatId: selectedChat._id,
        chatName: groupChatName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to rename chat');
    }

    const data = await response.json();
    dispatch(updateChat(data)); 
    setGroupChatName('');
    onClose();
  } catch (error) {
  }
};

    const handleAddUser = async (userToAdd) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/AddToGroup`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
            chatId: selectedChat._id,
            userId: userToAdd._id,
        }),
        });

        if (!response.ok) {
        throw new Error('Failed to add user to chat');
        }

        const data = await response.json();
        dispatch(addChatUser(data)); 
       
    } catch (error) {
    }
    };

    const handleRemove = async (userToRemove) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat/groupleave`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
            chatId: selectedChat._id,
            userId: userToRemove._id,
        }),
        });

        if (!response.ok) {
        throw new Error('Failed to remove user from chat');
        }

        const data = await response.json();
        setFetchAgain(!fetchAgain)
        fetchMessages();
        dispatch(removeChatUser(data)); 
    
    } catch (error) {
       
    }
    };

    const handleSearch = async () => {
    if (!search) return;

    try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/user/search?query=${search}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
        },
        });

        if (!response.ok) {
        throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        setSearchResult(data);
        setLoading(false);
    } catch (error) {
        setLoading(false);
       
    }
    };





  const dialogFooter = (
    <div>
      <Button style={{backgroundColor: 'mediumseagreen', border: '1px solid mediumseagreen', color: 'black'}} label="Update" onClick={handleRename} />
      <Button style={{backgroundColor: 'mediumseagreen', border: '1px solid mediumseagreen', color: 'black'}} label="Close" onClick={onClose} />
    </div>
  );

 return (
  <div>
    <Button style={{backgroundColor: 'mediumseagreen', border: '1px solid mediumseagreen', color: 'black'}} label="Edit Group" onClick={onOpen} />
    <Toast ref={toast} />
    <Dialog
      header={selectedChat.chatName}
      visible={isVisible}
      onHide={onClose}
      style={{ width: '50vw' }}
      modal
      footer={dialogFooter}
    >
      <div className="p-fluid">
        <div>
          {selectedChat.users.map((u) => (
            <Chip
              label={u.username}
              icon="pi pi-user"
              removable
              onRemove={() => handleRemove(u)}
              key={u._id}
            />
          ))}
        </div>


        <div className="p-field">
          <label htmlFor="chatName">Chat Name</label>
          <InputText
            id="chatName"
            value={groupChatName}
            onChange={(e) => setGroupChatName(e.target.value)}
            placeholder="Chat Name"
          />
          <Button
            style={{
              backgroundColor: 'mediumseagreen', 
              border: '1px solid mediumseagreen', 
              color: 'black'
            }}
            label="Update"
            onClick={handleRename}
            className="p-mt-2"
          />
        </div>

        <div className="p-field">
          <label htmlFor="addUsers">Add User to Group</label>
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter user name..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            label="Search"
            icon="pi pi-search"
            onClick={handleSearch}
            className="p-mt-2"
            style={{
              backgroundColor: 'mediumseagreen',
              border: '1px solid mediumseagreen',
              color: 'black'
              }}
          />
        </div>

        <div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            searchResult && searchResult.map(result => (
              <UserListItem
                key={result._id}
                user={result}
                handleFunction={() => handleAddUser(result)}
              />
            ))
          )}
        </div>
      </div>
    </Dialog>
  </div>
);
};

export default UpdateGroupChatModal;
