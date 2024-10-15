import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Router from './router/Router'; // Router component for handling routes
import { UserProvider } from './context/UserContext'; // User context provider

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement // Root element for rendering
);

root.render(
  <React.StrictMode>
    <UserProvider>
      <Router isdarkMode={true} />
    </UserProvider>
  </React.StrictMode>
);
