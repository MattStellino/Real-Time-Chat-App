import './App.css';
import { Routes, Route } from 'react-router-dom';
import Chatpage from './Pages/Chatpage';
import Homepage from './Pages/Homepage';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Routes>
            <Route path='/' element={<Homepage />} exact />
            <Route path='/chats' element={<Chatpage />} />
          </Routes>
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;
