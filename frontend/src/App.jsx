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
import LibraryTopic from './pages/LibraryTopic';
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
import UserManagement from './pages/UserManagement';
import ShopLandingPage from './pages/ShopLandingPage';
import YourPetDetail from './pages/YourPetDetail';
import CreateNewPet from './pages/CreateNewPetPage';
import AIChatPage from './pages/AIChatPage';
import CreateTrackingHealthPage from './pages/CreateTrackingHealthPage';
import ProductDetail from './pages/ProductDetail';
import PlanUpgrade from './pages/PlanUpgrade';
import LibraryCategory from './pages/LibraryCategory';
import ProductForm from './pages/ShopProductForm';
import ShopProductManagement from './pages/ShopProductManagement';
import LibraryManagement from './pages/LibraryManagement';
import AdminShopManagement from './pages/AdminShopManagement';
import PaymentProcessing from './pages/PaymentProcessing';
import ProductManagement from './pages/ProductManagement';

import CreateTreatmentPage from './pages/CreateTreatmentPage';
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
        Đang tải...
      </div>
    );
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
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Đang tải...
      </div>
    );
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
      <Route path="/ShopLandingPage" element={<ShopLandingPage />} />
      <Route path="/ProductDetail" element={<ProductDetail />} />
      <Route path="/PlanUpgrade" element={<PlanUpgrade />} />
      <Route path="/payment-processing" element={
        
        <ProtectedRoute>
          <PaymentProcessing />
        </ProtectedRoute>
      } />
      
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
       <Route path="/LibraryTopic" element={<LibraryTopic />} />
       <Route path="/LibraryCategory" element={<LibraryCategory />} />
       <Route path="/LibraryContent/:id" element={<LibraryContent />} />
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
      <Route path="/your-pet/detail/:reptileId" element={
        <ProtectedRoute>
          < YourPetDetail/>
        </ProtectedRoute>
      } />
      <Route path="/your-pet/create" element={
        <ProtectedRoute>
          < CreateNewPet/>
        </ProtectedRoute>
      } />
      <Route path="/your-pet/ai/:reptileId" element={
        <ProtectedRoute>
          < AIChatPage/>
        </ProtectedRoute>
      } />
      <Route path="/create-health-tracking/:reptileId" element={
        <ProtectedRoute>
          < CreateTrackingHealthPage/>
        </ProtectedRoute>
      } />
      <Route path="/create-treatment/:reptileId" element={
        <ProtectedRoute>
          < CreateTreatmentPage/>
        </ProtectedRoute>
      } />
      <Route path="/ShopProductManagement" element={<ShopProductManagement />} />
      <Route path="/shop/products/create" element={<ProductForm />} />
      
      {/* Admin only routes */}
      <Route path="/UserManagement" element={
        <ProtectedRoute requiredRole="admin">
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/ProductManagement" element={
        <ProtectedRoute requiredRole="admin">
          <ProductManagement />
        </ProtectedRoute>
      } />
      <Route path="/AdminShopManagement" element={
        <ProtectedRoute requiredRole="admin">
          <AdminShopManagement />
        </ProtectedRoute>
      } />
      <Route path="/LibraryManagement" element={
        <ProtectedRoute requiredRole="admin">
          <LibraryManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/products/create" element={
        <ProtectedRoute requiredRole="admin">
          <ProductForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/products/edit/:productId" element={
        <ProtectedRoute requiredRole="admin">
          <ProductForm />
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