import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PrimeReactProvider } from 'primereact/api';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PrimeReactProvider>
         <Provider store={store}>
          <App />
        </Provider>
      </PrimeReactProvider>
    </BrowserRouter>
  </React.StrictMode>
);
