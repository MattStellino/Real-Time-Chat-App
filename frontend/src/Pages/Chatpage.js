import MyChats from "../Components/MyChats";
import ChatPane from "../Components/ChatPane";
import TopSearch from "../Components/TopSearch";
import ChatDetails from "../Components/ChatDetails";
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../actions/authActions';
import { closeChatDetails, resetSelectedChat } from '../actions/chatActions';
import { getSender } from '../config/ChatLogics';
import { useNavigate } from 'react-router-dom';
import { OverlayPanel } from 'primereact/overlaypanel';
import useChromeNotifications from '../notifications/useChromeNotifications';
import socketService from '../services/socketService';
import '../styles/topsearch.css';

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);


  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [mobileView, setMobileView] = useState('chatList'); // 'chatList' or 'chatView'
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { selectedChat, ui } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  const { isDetailsOpen, detailsForChatId, isSearchOpen, isEditOpen } = ui;




  // Initialize socket connection
  useEffect(() => {
    if (user?.token) {
      const socket = socketService.connect(user.token);
      return () => {
        socketService.disconnect();
      };
    }
  }, [user?.token]);

  // Handle incoming messages and play sound
  const handleIncomingMessage = (message) => {
    // Add message to the appropriate chat in Redux store
    // This would typically dispatch an action to add the message

    // TODO: Add message to Redux store
  };

  // Use the Chrome notification hook
  useChromeNotifications({
    socket: socketService.getSocket(),
    currentUserId: user?._id,
    onIncomingMessageUpsert: handleIncomingMessage
  });



  // Handle user menu toggle
  const toggleUserMenu = (event) => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
  
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // Handle chat selection (mobile navigation)
  const handleChatSelect = (chat) => {
            if (isMobile) {
          setMobileView('chatView');
        }
  };

  // Handle back to chat list (mobile navigation)
  const handleBackToChatList = () => {
            setMobileView('chatList');
    dispatch(resetSelectedChat());
  };

  // Auto-switch to chat view if chat is selected on mobile
  useEffect(() => {
    if (isMobile && selectedChat && mobileView === 'chatList') {
              setMobileView('chatView');
    }
  }, [isMobile, selectedChat]);

  // Handle escape key to close user menu
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && userMenuOpen) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [userMenuOpen]);



  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setUserMenuOpen(false);
  };

  // Check authentication and redirect if needed
  useEffect(() => {
    // Check if we have stored authentication data
    const storedToken = localStorage.getItem('persist:root');
    const hasStoredAuth = storedToken && storedToken.includes('"isAuthenticated":true');
    
    if (!isAuthenticated || !user) {
      console.log('Authentication check failed:', { 
        isAuthenticated, 
        user: !!user, 
        hasStoredAuth,
        storedToken: !!storedToken 
      });
      
      // If we have stored auth but current state is false, wait for Redux to restore
      if (hasStoredAuth) {
        console.log('Waiting for Redux to restore authentication state...');
        return;
      }
      
      // Only redirect if we truly have no stored authentication
      const timer = setTimeout(() => {
        if (!isAuthenticated || !user) {
          console.log('Redirecting to login - no stored authentication found');
          navigate('/');
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Checking authentication...</div>
      </div>
    );
  }

  // Debug logging
  

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          {/* Back button for mobile chat view */}
          {isMobile && mobileView === 'chatView' && (
            <button 
              className="navbar-button back-button"
              onClick={handleBackToChatList}
              aria-label="Back to chats"
            >
              <i className="pi pi-arrow-left"></i>
            </button>
          )}
          
          <div className="navbar-brand">
            <i className="pi pi-comments"></i>
            <span>ChatApp</span>
          </div>
          

        </div>
        
        <div className="navbar-center">
          <TopSearch />
        </div>
        
        <div className="navbar-right">
          <div className="navbar-user" onClick={toggleUserMenu}>
            <div className="user-avatar">
              <i className="pi pi-user"></i>
            </div>
            <span className="user-name">{user?.username || 'User'}</span>
            <i className="pi pi-chevron-down"></i>
            
            {userMenuOpen && (
              <div className="user-dropdown-custom">
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/profile');
                    setUserMenuOpen(false);
                  }}
                >
                  <i className="pi pi-user"></i>
                  Profile
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/settings');
                    setUserMenuOpen(false);
                  }}
                >
                  <i className="pi pi-cog"></i>
                  Settings
                </button>
                <hr className="dropdown-divider" />
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <i className="pi pi-sign-out"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Desktop Layout */}
      {!isMobile && (
        <>

          
          {/* Left Pane - Conversations */}
          <aside className="left">
            <div className="left-content">
              <MyChats fetchAgain={fetchAgain} />
            </div>
            

          </aside>

          {/* Center Pane - Chat */}
          <main className="center">
            <ChatPane 
              fetchAgain={fetchAgain} 
              setFetchAgain={setFetchAgain} 
            />
          </main>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
  
          

          
          {/* Show chat list by default on mobile */}
          {mobileView === 'chatList' && (
            <main className="mobile-full">
              <MyChats fetchAgain={fetchAgain} onChatSelect={handleChatSelect} />
            </main>
          )}

          {/* Show chat view when chat is selected */}
          {mobileView === 'chatView' && selectedChat && (
            <main className="mobile-full">
              <ChatPane 
                fetchAgain={fetchAgain} 
                setFetchAgain={setFetchAgain} 
              />
            </main>
          )}
          
          {/* Fallback - always show something on mobile */}
          {mobileView !== 'chatList' && mobileView !== 'chatView' && (
            <main className="mobile-full">
              <MyChats fetchAgain={fetchAgain} onChatSelect={handleChatSelect} />
            </main>
          )}
        </>
      )}



      {/* Chat Details Components */}
      <ChatDetails 
        isOpen={isDetailsOpen}
        chatId={detailsForChatId || selectedChat?._id}
        onClose={() => dispatch(closeChatDetails())}
      />
    </div>
  );
};

export default Chatpage;
