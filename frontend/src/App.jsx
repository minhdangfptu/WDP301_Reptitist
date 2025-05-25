import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/SignUp2" element={<SignUp2 />} />
            <Route path="/SignUp3" element={<SignUp3 />} />
            <Route path="/ContactUs" element={<ContactUs />} />
            <Route path="/ShopLandingPage" element={<ShopLandingPage />} />

            {/* Protected routes */}
            <Route
              path="/Profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Security"
              element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              }
            />
            <Route
              path="/YourPet"
              element={
                <ProtectedRoute>
                  <YourPet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Library"
              element={
                <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
              }
            />
            <Route
              path="/LibraryDetail"
              element={
                <ProtectedRoute>
                  <LibraryDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/LibraryDetail2"
              element={
                <ProtectedRoute>
                  <LibraryDetail2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Transaction"
              element={
                <ProtectedRoute>
                  <Transaction />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <UserList />
                </AdminRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;