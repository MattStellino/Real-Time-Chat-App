import React from 'react';
import { Avatar } from 'primereact/avatar'; // PrimeReact Avatar component
import 'primeflex/primeflex.css'; // PrimeFlex for styling

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      className="p-d-flex p-ai-center p-mb-2"
      style={{ 
        cursor: 'pointer',
        padding: '20px',
        border: '1px solid black' }}
    >
      <Avatar 
        label={user.username} 
        className="p-mr-2" 
        size="small" 
        style={{
          cursor: 'pointer',
          backgroundColor: 'white', 
          padding: '20px' }}
      />
      <div>
        <span className="p-text-bold">{user.email}</span>
      </div>
    </div>
  );
};

export default UserListItem;