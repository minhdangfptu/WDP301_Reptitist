import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './app/store';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import LandingPage from './pages/LandingPage';
import ContactUs from './pages/ContactUs';
import Library from './pages/Library';
import LibraryDetail from './pages/LibraryDetail';
import LibraryDetail2 from './pages/LibraryDetail2';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import SignUp2 from './pages/SignUp2';
import SignUp3 from './pages/SignUp3';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Security from './pages/Security';
import YourPet from './pages/YourPet';
import Transaction from './pages/Transaction';
import UserList from './pages/UserList';
import ShopLandingPage from './pages/ShopLandingPage';
import UserReptileDetail from './pages/UserReptileDetail';
// import loadinggif from './public/loading.gif';
// Protected Route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        <img src="/loading.gif" alt="loading" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route component (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
       <img src="/loading.gif" alt="loading" />
      </div>
    );
  }

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/LandingPage" element={<LandingPage />} />
      <Route path="/ContactUs" element={<ContactUs />} />
      <Route path="/Library" element={<Library />} />
      <Route path="/LibraryDetail" element={<LibraryDetail />} />
      <Route path="/LibraryDetail2/:categoryId" element={<LibraryDetail2 />} />
      <Route path="/ShopLandingPage" element={<ShopLandingPage />} />
      
      {/* Auth routes - redirect if already logged in */}
      <Route path="/Login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/SignUp" element={
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      } />
      <Route path="/SignUp2" element={
        <PublicRoute>
          <SignUp2 />
        </PublicRoute>
      } />
      <Route path="/SignUp3" element={
        <PublicRoute>
          <SignUp3 />
        </PublicRoute>
      } />
      
      {/* Protected routes - require login */}
      <Route path="/Profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/Security" element={
        <ProtectedRoute>
          <Security />
        </ProtectedRoute>
      } />
      <Route path="/Settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/YourPet" element={
        <ProtectedRoute>
          <YourPet />
        </ProtectedRoute>
      } />
      <Route path="/Transaction" element={
        <ProtectedRoute>
          <Transaction />
        </ProtectedRoute>
      } />
      <Route path="/your-pet/detail" element={
        <ProtectedRoute>
          < UserReptileDetail/>
        </ProtectedRoute>
      } />
      
      {/* Admin only routes */}
      <Route path="/UserList" element={
        <ProtectedRoute requiredRole="admin">
          <UserList />
        </ProtectedRoute>
      } />
      
      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;