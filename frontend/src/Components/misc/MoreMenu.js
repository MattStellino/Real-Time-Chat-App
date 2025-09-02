import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { openChatDetails } from '../../actions/chatActions';

const MoreMenu = ({ chatId }) => {
  const overlayRef = useRef(null);
  const dispatch = useDispatch();

  const handleChatDetails = () => {

    dispatch(openChatDetails(chatId));
    overlayRef.current?.hide();
  };

  return (
    <>
      <Button
        icon="pi pi-ellipsis-v"
        className="header-button more-menu-trigger"
        onClick={(e) => overlayRef.current?.toggle(e)}
        aria-label="More options"
      />
      
      <OverlayPanel
        ref={overlayRef}
        appendTo={document.body}
        className="more-menu-overlay"
        style={{ zIndex: 1100 }}
      >
        <div className="more-menu">
          <div className="more-menu-item" onClick={handleChatDetails}>
            <i className="pi pi-info-circle"></i>
            <span>Chat Details</span>
          </div>
        </div>
      </OverlayPanel>
    </>
  );
};

export default MoreMenu;
