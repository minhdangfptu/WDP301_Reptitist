import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './app/store';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LandingPage from './pages/LandingPage';
import ContactUs from './pages/ContactUs';
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

import Library from './pages/LibraryTopic';
import LibraryCategory from './pages/LibraryCategory';
import LibraryContent from './pages/LibraryContent';
import LibraryContentCreate from './pages/LibraryCategoryCreate';
import CreateLibraryTopic from './pages/LibraryTopicCreate';
import UpdateLibraryTopic from './pages/LibraryTopicUpdate';
import CreateCategory from './pages/CreateCategory';
import UpdateCategory from './pages/UpdateCategory';

import ProductsByCategory from './pages/ProductsByCategory';
import AddProduct from './pages/AddProduct';

// Loading spinner
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

// Protected route
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/Login" replace state={{ from: window.location.pathname }} />;
  if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/" replace />;
  
  return children;
};

// Public route
const PublicRoute = ({ children, redirectIfAuthenticated = true }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user && redirectIfAuthenticated) return <Navigate to="/" replace />;
  
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/LandingPage" element={<LandingPage />} />
    <Route path="/ContactUs" element={<ContactUs />} />
    <Route path="/Login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/SignUp" element={<PublicRoute><SignUp /></PublicRoute>} />
    <Route path="/SignUp2" element={<PublicRoute><SignUp2 /></PublicRoute>} />
    <Route path="/SignUp3" element={<PublicRoute><SignUp3 /></PublicRoute>} />

    {/* Library */}
    <Route path="/Library" element={<Library />} />
    <Route path="/libraryCategory/:id" element={<LibraryCategory />} />
    <Route path="/librarycontent/:categoryId" element={<LibraryContent />} />
    <Route
      path="/libraryCategory/create/:categoryId"
      element={<ProtectedRoute><LibraryContentCreate /></ProtectedRoute>}
    />

    {/* Library topic/category management (admin/editor only) */}
    <Route path="/library_topics/create" element={<ProtectedRoute requiredRole="admin"><CreateLibraryTopic /></ProtectedRoute>} />
    <Route path="/library_topics/update/:id" element={<ProtectedRoute requiredRole="admin"><UpdateLibraryTopic /></ProtectedRoute>} />
    <Route path="/library_categories/create/:topicId" element={<ProtectedRoute requiredRole="admin"><CreateCategory /></ProtectedRoute>} />
    <Route path="/library_categories/update/:id" element={<ProtectedRoute requiredRole="admin"><UpdateCategory /></ProtectedRoute>} />

    {/* Product routes */}
    <Route path="/products/category/:categoryId" element={<ProductsByCategory />} />
    <Route path="/products/create" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />

    {/* Shop */}
    <Route path="/ShopLandingPage" element={<ShopLandingPage />} />
    <Route path="/PlanUpgrade" element={<PlanUpgrade />} />

    {/* Protected - user logged in */}
    <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/Security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
    <Route path="/Settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/YourPet" element={<ProtectedRoute><YourPet /></ProtectedRoute>} />
    <Route path="/Transaction" element={<ProtectedRoute><Transaction /></ProtectedRoute>} />

    {/* Admin only */}
    <Route path="/UserList" element={<ProtectedRoute requiredRole="admin"><UserList /></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
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

export default App;
