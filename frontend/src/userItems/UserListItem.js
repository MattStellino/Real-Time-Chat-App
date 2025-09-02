import React from 'react';

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      className="conv-item"
      style={{ cursor: 'pointer' }}
    >
      <div className="conv-avatar">
        {user.username.charAt(0).toUpperCase()}
      </div>
      <div className="conv-info">
        <div className="conv-name">
          {user.username}
        </div>
        <div className="conv-preview">
          {user.email}
        </div>
      </div>
    </div>
  );
};

export default UserListItem;