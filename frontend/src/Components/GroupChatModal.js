import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import { updateGroupChatTitle, addUserToGroup, removeUserFromGroup, leaveGroup } from '../actions/chatActions';
import './GroupChatModal.css';

const GroupChatModal = ({ isOpen, chat, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { chats, selectedChat } = useSelector(state => state.chat);
  
  // Get the latest chat data from Redux store instead of just the prop
  const currentChat = chats.find(c => c._id === chat?._id) || chat;
  
  const [groupName, setGroupName] = useState(currentChat?.chatName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Update local state when currentChat changes (e.g., when members are added/removed)
  useEffect(() => {
    if (currentChat) {
      setGroupName(currentChat.chatName || '');
    }
  }, [currentChat?.chatName, currentChat?.users?.length]);

  // Get all users from other chats to suggest for adding
  const getAllUsers = () => {
    const allUsers = new Set();
    chats.forEach(chat => {
      if (chat.users && Array.isArray(chat.users)) {
        chat.users.forEach(chatUser => {
          if (chatUser && chatUser._id && chatUser.username && chatUser._id !== user._id) {
            allUsers.add(chatUser);
          }
        });
      }
    });
    return Array.from(allUsers);
  };

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const allUsers = getAllUsers();
      const filtered = allUsers.filter(user => 
        user && user.username && 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !currentChat.users.find(chatUser => chatUser && chatUser._id === user._id) // Don't show users already in group
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, currentChat, chats, user._id]);

  const handleSaveName = async () => {
    if (groupName.trim() && groupName !== currentChat.chatName) {
      try {
        await dispatch(updateGroupChatTitle(currentChat._id, groupName.trim()));
        setIsEditingName(false);
        // Show success feedback
        alert('Group name updated successfully!');
      } catch (error) {
        console.error('Failed to update group name:', error);
        alert('Failed to update group name');
      }
    } else {
      setIsEditingName(false);
    }
  };

  const handleAddUser = async () => {
    if (selectedUser && selectedUser._id && selectedUser.username) {
      try {
        await dispatch(addUserToGroup(currentChat._id, selectedUser._id));
        setSelectedUser(null);
        setSearchQuery('');
        setFilteredUsers([]); // Clear filtered users as well
        alert(`${selectedUser.username} added to group successfully!`);
      } catch (error) {
        console.error('Failed to add user to group:', error);
        alert('Failed to add user to group');
      }
    }
  };

  const handleRemoveUser = async (userId) => {
    if (userId !== user._id) { // Can't remove yourself
      try {
        const userToRemove = currentChat.users.find(u => u && u._id === userId);
        if (userToRemove && userToRemove.username) {
          await dispatch(removeUserFromGroup(currentChat._id, userId));
          alert(`${userToRemove.username} removed from group successfully!`);
        } else {
          alert('User not found');
        }
      } catch (error) {
        console.error('Failed to remove user from group:', error);
        alert('Failed to remove user from group');
      }
    }
  };

  const handleLeaveGroup = async () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeaveGroup = async () => {
    try {
      await dispatch(leaveGroup(currentChat._id));
      onClose();
      alert('You have left the group successfully!');
    } catch (error) {
      console.error('Failed to leave group:', error);
      alert('Failed to leave group');
    }
    setShowLeaveConfirm(false);
  };

  const handleClose = () => {
    setGroupName(currentChat?.chatName || '');
    setIsEditingName(false);
    setSearchQuery('');
    setSelectedUser(null);
    setShowLeaveConfirm(false);
    onClose();
  };

  if (!isOpen || !currentChat || !currentChat.users || !Array.isArray(currentChat.users)) return null;

  return (
    <Dialog
      visible={isOpen}
      onHide={handleClose}
      header="Group Chat Settings"
      className="group-chat-modal"
      closeOnEscape={true}
      closable={true}
      modal={true}
      style={{ width: '90vw', maxWidth: '600px' }}
    >
      <div className="group-chat-content">
        {/* Group Name Section */}
        <div className="group-name-section">
          <h3>Group Name</h3>
          {isEditingName ? (
            <div className="edit-name-container">
              <InputText
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="group-name-input"
                autoFocus
              />
              <div className="edit-actions">
                <Button 
                  label="Save" 
                  icon="pi pi-check" 
                  onClick={handleSaveName}
                  size="small"
                  className="p-button-success"
                />
                                 <Button 
                   label="Cancel" 
                   icon="pi pi-times" 
                   onClick={() => {
                     setGroupName(currentChat.chatName);
                     setIsEditingName(false);
                   }}
                   size="small"
                   className="p-button-text"
                 />
              </div>
            </div>
          ) : (
            <div className="display-name-container">
              <span className="current-name">{currentChat.chatName}</span>
              <Button 
                icon="pi pi-pencil" 
                onClick={() => setIsEditingName(true)}
                size="small"
                className="p-button-text"
                aria-label="Edit group name"
              />
            </div>
          )}
        </div>

                 {/* Members Section */}
         <div className="members-section">
           <h3>Members ({currentChat.users ? currentChat.users.length : 0})</h3>
           <div className="members-list">
             {currentChat.users && currentChat.users.map(member => (
               member && member._id && member.username ? (
                 <div key={member._id} className="member-item">
                   <div className="member-info">
                     <div className="member-avatar">
                       {member.username.charAt(0).toUpperCase()}
                     </div>
                     <span className="member-name">{member.username}</span>
                                        {member._id === currentChat.groupAdmin && (
                     <span className="admin-badge">Admin</span>
                   )}
                   </div>
                   {member._id !== user._id && (
                     <Button 
                       icon="pi pi-times" 
                       onClick={() => handleRemoveUser(member._id)}
                       size="small"
                       className="p-button-danger p-button-text"
                       aria-label="Remove member"
                     />
                   )}
                 </div>
               ) : null
             ))}
           </div>
         </div>

        {/* Add Member Section */}
        <div className="add-member-section">
          <h3>Add Member</h3>
          <div className="add-member-container">
            <AutoComplete
              value={selectedUser}
              suggestions={filteredUsers}
              completeMethod={(e) => setSearchQuery(e.query)}
              field="username"
              placeholder="Search users to add..."
              className="user-search-input"
              onChange={(e) => setSelectedUser(e.value)}
            />
            <Button 
              label="Add" 
              icon="pi pi-plus" 
              onClick={handleAddUser}
              disabled={!selectedUser}
              size="small"
              className="p-button-success"
            />
          </div>
        </div>

                 {/* Leave Group Section */}
         <div className="leave-group-section">
           <Button 
             label="Leave Group" 
             icon="pi pi-sign-out" 
             onClick={handleLeaveGroup}
             className="p-button-danger p-button-outlined"
           />
         </div>
       </div>

       {/* Leave Confirmation Dialog */}
       <Dialog
         visible={showLeaveConfirm}
         onHide={() => setShowLeaveConfirm(false)}
         header="Confirm Leave Group"
         className="leave-confirm-modal"
         closeOnEscape={true}
         closable={true}
         modal={true}
         style={{ width: '90vw', maxWidth: '400px' }}
       >
         <div className="leave-confirm-content">
           <p>Are you sure you want to leave this group?</p>
           <p className="warning-text">This action cannot be undone.</p>
           <div className="confirm-actions">
             <Button 
               label="Cancel" 
               onClick={() => setShowLeaveConfirm(false)}
               className="p-button-text"
             />
             <Button 
               label="Leave Group" 
               onClick={confirmLeaveGroup}
               className="p-button-danger"
             />
           </div>
         </div>
       </Dialog>
     </Dialog>
   );
 };

export default GroupChatModal;
