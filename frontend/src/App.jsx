import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';

import '@fortawesome/fontawesome-free/css/all.min.css';

import LandingPage from './pages/LandingPage';
import ContactUs from './pages/ContactUs';
import Library from './pages/Library'; 
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import LibraryDetail from './pages/LibraryDetail';
import LibraryDetail2 from './pages/LibraryDetail2';
import YourPet from './pages/YourPet';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Transaction from './pages/Transaction';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/ContactUs" element={<ContactUs />} />
          <Route path="/Library" element={<Library />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/LibraryDetail" element={<LibraryDetail />} />
          <Route path="/LibraryDetail2/1" element={<LibraryDetail2 />} />
          <Route path="/YourPet" element={<YourPet />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Security" element={<Security />} />
          <Route path="/Transaction" element={<Transaction />} />
          <Route path="/Settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;