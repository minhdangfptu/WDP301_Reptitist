import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import '@fortawesome/fontawesome-free/css/all.min.css';
import { Provider } from 'react-redux';
import { store } from './app/store';
import LandingPage from './pages/LandingPage';
import ContactUs from './pages/ContactUs';
import Library from './pages/Library';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import SignUp2 from './pages/SignUp2';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Security from './pages/Security';
import YourPet from './pages/YourPet';
import Library from './pages/Library';
import LibraryDetail from './pages/LibraryDetail';
import LibraryDetail2 from './pages/LibraryDetail2';
import Transaction from './pages/Transaction';
import ContactUs from './pages/ContactUs';
import UserList from './pages/UserList';
import SignUp3 from './pages/SignUp3';
import ShopLandingPage from './pages/ShopLandingPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/Login" />;
  }

  return children;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <Provider store={store}>
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
            <Route path="/SignUp2" element={<SignUp2 />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App;