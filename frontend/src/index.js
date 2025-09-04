import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import App from './App';
import { PrimeReactProvider } from 'primereact/api';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { Provider } from 'react-redux';
import { PRIME_CONFIG } from './config/primeReactConfig';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PrimeReactProvider value={PRIME_CONFIG}>
         <Provider store={store}>
          <App />
        </Provider>
      </PrimeReactProvider>
    </BrowserRouter>
  </React.StrictMode>
);
