import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Menu } from 'primereact/menu';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './misc/ProfileModal'; 
import UserListItem from '../userItems/UserListItem'; 
import { setSelectedChat, setChats } from '../actions/chatActions';
import { logout } from '../actions/authActions';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, chats } = useSelector(state => state.chat);

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const toast = useRef(null);
  const menu = useRef(null);

  useEffect(() => {}, []);

  const handleSearch = async () => {
    if (!search) {
      toast.current.show({ severity: 'warn', summary: 'Please Enter something in search', life: 5000 });
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/user/search?query=${search}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch search results');

      const data = await response.json();
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error Occurred!', detail: 'Failed to Load the Search Results', life: 5000 });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const response = await fetch(`http://localhost:5000/api/chat`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Error fetching the chat');

      const data = await response.json();
      if (!chats.find((c) => c._id === data._id)) {
        dispatch(setChats([data, ...chats]));
      }
      dispatch(setSelectedChat(data));
      setLoadingChat(false);
      closeSearchDialog();
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error fetching the chat', detail: error.message, life: 5000 });
    }
  };

  const openSearchDialog = () => setIsDialogVisible(true);
  const closeSearchDialog = () => setIsDialogVisible(false);
  const toggleProfileModal = () => setIsProfileModalVisible(prevState => !prevState);

  const menuItems = [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        dispatch(logout());
        navigate('/');
      }
    }
  ];

  return (
    <div>
      <div>
        <h1 style={{fontFamily: 'Monospace', fontSize: '4em'}}className="text-center">Chat App</h1>
      </div>
      <div className="flex justify-content-between align-items-center" style={{ paddingLeft: '50px', margin: '10px' }}>
        <Toast ref={toast} />
        <Button label="New Chat" icon="pi pi-search" onClick={openSearchDialog} className="p-mr-2" style={{ backgroundColor: 'mediumseagreen', border: '1px solid mediumseagreen', color: 'black' }} />

        <Dialog header="Search Users" visible={isDialogVisible} style={{ width: '50vw', color: 'black' }}  onHide={closeSearchDialog}>
          <div className="p-fluid">
            <InputText style ={{border: '1px solid mediumseagreen'}}value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter user name..." onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <Button style={{backgroundColor: 'mediumseagreen', color: 'black', border: '1px solid mediumseagreen'}}label="Search" icon="pi pi-search" onClick={handleSearch} className="p-mt-2" />
            <div className="search-results">
              {loading ? <ProgressSpinner /> : searchResult.map(user => (
                <UserListItem key={user.id} user={user} handleFunction={() => accessChat(user._id)} />
              ))}
              {loadingChat && <ProgressSpinner />}
            </div>
          </div>
        </Dialog>

        {user && (
          <div style={{ paddingRight: '50px' }}>
            <ProfileModal user={user} isVisible={isProfileModalVisible} onHide={toggleProfileModal} />
            <Button style={{ backgroundColor: 'mediumseagreen', color: 'black' }} icon="pi pi-chevron-down" onClick={(e) => menu.current.toggle(e)} aria-controls="popup_menu" aria-haspopup className="p-button-rounded p-button-text p-mr-2" />
            <Menu model={menuItems} popup ref={menu} id="popup_menu" />
          </div>
        )}
      </div>
    </div>
  );
}


export default Header;
