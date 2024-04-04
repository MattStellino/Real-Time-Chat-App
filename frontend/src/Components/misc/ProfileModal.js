import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';


const ProfileModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const user = useSelector(state => state.user.user);

  const onOpen = () => setIsVisible(true);
  const onClose = () => setIsVisible(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <Button
        icon="pi pi-eye"
        onClick={onOpen}
        className="p-button-rounded p-button-success"
        style={{
          backgroundColor: 'mediumseagreen',
          color: 'black',
          border: '1px solid mediumseagreen'}}
      />
      <Dialog
       
        visible={isVisible}
        style={{
          display: 'flex',
          flexDirection: 'row',      
        }}
        
        onHide={onClose}
      >
        <div>
          <div style={{
            fontSize: '2.5em',
            textAlign: 'center', 
            marginTop: '20px',
            color: 'black'
          }}>
            {user.username}<br/>
            Email: {user.email}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ProfileModal;
