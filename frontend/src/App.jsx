import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';

import '@fortawesome/fontawesome-free/css/all.min.css';
import { Provider } from 'react-redux';
import { store } from './app/store';
import LandingPage from './pages/LandingPage';
import ContactUs from './pages/ContactUs';
<<<<<<< Updated upstream
import Library from './pages/Library';
=======
import Library from './pages/LibraryTopic';
import LibraryCategory from './pages/LibraryCategory';
import LibraryDetail2 from './pages/LibraryDetail2';
>>>>>>> Stashed changes
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import LibraryDetail from './pages/LibraryDetail';
import LibraryDetail2 from './pages/LibraryDetail2';
import YourPet from './pages/YourPet';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Transaction from './pages/Transaction';
import Settings from './pages/Settings';
import SignUp2 from './pages/SignUp2';

<<<<<<< Updated upstream
function App() {
=======
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
      {/* Public routes - accessible to everyone */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/LandingPage" element={<LandingPage />} />
      <Route path="/ContactUs" element={<ContactUs />} />
      <Route path="/Library" element={<Library />} />
      <Route path="/libraryCategory/:id" element={<LibraryCategory />} />
      {/* <Route path="/LibraryDetail2/:categoryId" element={<LibraryDetail2 />} /> */}
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
>>>>>>> Stashed changes
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
}

export default App;