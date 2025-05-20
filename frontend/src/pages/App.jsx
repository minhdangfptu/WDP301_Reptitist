import React from 'react';
import ReactDOM from 'react-dom/client'; // Sửa import ReactDOM
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import './css/Login.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import LandingPage from './pages/LandingPage';
import ContactUs from './pages/ContactUs';
import Library from './pages/Library'; 
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/library" element={<Library />} /> {/* Sửa path */}
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}