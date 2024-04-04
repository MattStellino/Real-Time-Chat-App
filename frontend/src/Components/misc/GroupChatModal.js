import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Chip } from 'primereact/chip';
import { Toast } from 'primereact/toast';
import { setChats } from '../../actions/chatActions';
import UserListItem from '../../userItems/UserListItem';

const GroupChatModal = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { user, chats } = useSelector(state => state.chat);
  const toast = useRef(null);

  const onOpen = () => setIsVisible(true);
  const onClose = () => setIsVisible(false);

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast.current.show({
        severity: "warning",
        summary: "User already added",
        life: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async () => {
    if (!search) {
      toast.current.show({
        severity: 'warn',
        summary: 'Please Enter something in search',
        life: 5000
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/user/search?query=${search}`, {
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
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast.current.show({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      console.warn("Missing fields: ", { groupChatName, selectedUsers });
      toast.current.show({
        summary: "Please fill all the fields",
        severity: "warn",
        life: 5000,
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/chat/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: groupChatName,
          users: selectedUsers.map((u) => u._id),
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      dispatch(setChats([data, ...chats]));
      onClose();
      toast.current.show({
        summary: "New Group Chat Created!",
        severity: "success",
        life: 5000,
      });
    } catch (error) {
      console.error("Error in handleSubmit: ", error);
      toast.current.show({
        summary: "Failed to Create the Chat!",
        detail: error.message,
        severity: "error",
        life: 5000,
      });
    }
  };

  const dialogFooter = (
    <div >
      <Button style={{backgroundColor: 'mediumseagreen', border: '1px solid mediumseagreen', color: 'black'}} label="Create Chat" onClick={handleSubmit} />
      <Button  style={{backgroundColor: 'mediumseagreen', border: '1px solid mediumseagreen', color: 'black'}}label="Close" onClick={onClose} />
    </div>
  );

  return (
    <div>
      <span onClick={onOpen}>{children}</span>
      <Toast ref={toast} />
      <Dialog
        header="Create Group Chat"
        visible={isVisible}
        onHide={onClose}
        style={{ width: '50vw' }}
        modal
        footer={dialogFooter}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="chatName">Chat Name</label>
            <InputText id="chatName" value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} />
          </div>
          <div className="p-field">
            <label htmlFor="addUsers">Add Users</label>
            <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter user name..." onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <Button label="Search" icon="pi pi-search" onClick={handleSearch} className="p-mt-2" style={{backgroundColor: 'mediumseagreen', border: '1px solid mediumseagreen', color: 'black'}} />
          </div>
          <div>
            {selectedUsers.map(u => (
              <Chip label={u.username} icon="pi pi-user" removable onRemove={() => handleDelete(u)} key={u._id} />
            ))}
          </div>
          <div>
            {loading ? (
              <div>Loading...</div>
            ) : (
              searchResult && searchResult.map(result => (
                <UserListItem
                  key={result._id}
                  user={result}
                  handleFunction={() => handleGroup(result)}
                />
              ))
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default GroupChatModal;
