import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import '@fortawesome/fontawesome-free/css/all.min.css';

import LandingPage from './pages/LandingPage';
import ContactUs from './pages/ContactUs';
import Library from './pages/Library'; 
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import LibraryDetail from './pages/LibraryDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/Library" element={<Library />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/LibraryDetail" element={<LibraryDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);