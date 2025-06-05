import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './app/store';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import LibraryContentCreate from './pages/LibraryCategoryCreate';
// Import components
import LandingPage from './pages/LandingPage';
import ContactUs from './pages/ContactUs';
import Library from './pages/LibraryTopic';
import LibraryDetail from './pages/LibraryCategory';
import LibraryContent from './pages/LibraryContent';
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
import PlanUpgrade from './pages/PlanUpgrade';
import LibraryCategory from './pages/LibraryCategory';
import ProductsByCategory from "./pages/ProductsByCategory"; 
import AddProduct from "./pages/AddProduct";


// Loading component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div className="spinner"></div>
    <div>Đang tải...</div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/Login" replace state={{ from: window.location.pathname }} />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route component (redirect to home if already logged in)
const PublicRoute = ({ children, redirectIfAuthenticated = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is already logged in and we should redirect
  if (user && redirectIfAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/products/category/:categoryId" element={<ProductsByCategory />} />
      <Route path="/products/create" element={<AddProduct />} />
      {/* Public routes - accessible to everyone */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/LandingPage" element={<LandingPage />} />
      <Route path="/ContactUs" element={<ContactUs />} />
      <Route path="/Library" element={<Library />} />
      <Route path="/libraryCategory/:id" element={<LibraryCategory />} />
            <Route
              path="/libraryCategory/create/:categoryId"
              element={
                <ProtectedRoute>
                  <LibraryContentCreate />
                </ProtectedRoute>
              }
            />
      {/* <Route path="/LibraryDetail2/:categoryId" element={<LibraryDetail2 />} /> */}
      <Route path="/librarycontent/:categoryId" element={<LibraryContent />} />

      <Route path="/ShopLandingPage" element={<ShopLandingPage />} />
      <Route path="/PlanUpgrade" element={<PlanUpgrade />} />
      
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
            <div className="app">
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;