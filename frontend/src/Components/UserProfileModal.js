import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { fetchUserProfile, clearViewingUser } from '../actions/userActions';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, userId, onClose }) => {
  const dispatch = useDispatch();
  const { viewingUser, loading, error } = useSelector(state => state.user);
  const { user: currentUser } = useSelector(state => state.user);

  useEffect(() => {
    if (isOpen && userId && userId !== currentUser?._id) {
      dispatch(fetchUserProfile(userId));
    }
  }, [isOpen, userId, dispatch, currentUser?._id]);

  useEffect(() => {
    if (!isOpen) {
      // Clear the viewing user when modal closes
      dispatch(clearViewingUser());
    }
  }, [isOpen, dispatch]);

  const handleClose = () => {
    onClose();
  };

  const renderAvatar = (user) => {
    if (user?.avatarUrl) {
      return (
        <img 
          src={user.avatarUrl} 
          alt={`${user.username}'s avatar`}
          className="user-profile-avatar"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className="user-profile-avatar-fallback">
        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog
      visible={isOpen}
      onHide={handleClose}
      header="User Profile"
      className="user-profile-modal"
      closeOnEscape={true}
      closable={true}
      modal={true}

    >
      <div className="user-profile-content">
        {loading && (
          <div className="loading-state">
            <i className="pi pi-spin pi-spinner"></i>
            <p>Loading profile...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <i className="pi pi-exclamation-triangle"></i>
            <p>Error loading profile: {error}</p>
          </div>
        )}

        {viewingUser && !loading && (
          <div className="profile-info">
            <div className="avatar-section">
              {renderAvatar(viewingUser)}
            </div>
            
            <div className="user-details">
              <h2 className="username">{viewingUser.username || 'Unknown User'}</h2>
              
              {viewingUser.bio && (
                <div className="bio-section">
                  <h3>About</h3>
                  <p className="bio-text">{viewingUser.bio}</p>
                </div>
              )}
              
              <div className="user-meta">
                <div className="meta-item">
                  <i className="pi pi-calendar"></i>
                  <span>Member since {new Date(viewingUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </Dialog>
  );
};

export default UserProfileModal;
