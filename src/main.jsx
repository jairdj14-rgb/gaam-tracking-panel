import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

import { Toaster } from 'react-hot-toast';

console.log(import.meta.env.VITE_API_URL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,

          style: {
            background: 'rgba(15,23,42,0.92)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            backdropFilter: 'blur(18px)',
            padding: '14px 18px',
            fontSize: '14px',
          },
        }}
      />
    </>
  </React.StrictMode>,
);
