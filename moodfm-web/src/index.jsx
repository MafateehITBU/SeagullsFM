import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "./context/AuthContext";
import { StaticInfoProvider } from "./context/StaticInfoContext";
import { LiveStreamProvider } from "./context/LiveStreamContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StaticInfoProvider>
          <LiveStreamProvider>
            <App />
          </LiveStreamProvider>
        </StaticInfoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);


reportWebVitals();
