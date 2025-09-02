// Main App component with routing and theme management
// Wraps app with Redux store and handles light/dark theme switching
import './styles/theme.css';
import './styles/layout.css';
import './styles/auth.css';
import './styles/chat.css';
import './styles/sidebar.css';
import './styles/header.css';
import './styles/modal.css';
import './styles/chat-details.css';
import './styles/group-chat-modal.css';
import './styles/toast.css';
import './styles/image-carousel.css';
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Chatpage from './Pages/Chatpage';
import Homepage from './Pages/Homepage';
import Profile from './Pages/Profile';
import Settings from './Pages/Settings';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { chromeNotificationManager } from './notifications/ChromeNotificationManager';

function App() {
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('chat-app-theme');
    if (savedTheme === 'light') {
      setIsLightTheme(true);
      document.documentElement.classList.add('theme-light');
    }
    
    // Request notification permission on app startup
    chromeNotificationManager.requestPermission();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isLightTheme;
    setIsLightTheme(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('theme-light');
      localStorage.setItem('chat-app-theme', 'light');
    } else {
      document.documentElement.classList.remove('theme-light');
      localStorage.setItem('chat-app-theme', 'dark');
    }
  };

  return (
    <div className="App">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {/* GlobalMessageHandler removed */}
          <Routes>
            <Route path='/' element={<Homepage />} exact />
            <Route path='/chats' element={<Chatpage />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/settings' element={<Settings />} />
          </Routes>
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;
