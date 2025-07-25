import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import '../css/Profile.css';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../config';

const Profile = () => {
  const { user, updateUser, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [editForm, setEditForm] = useState({
    fullname: '',
    phone_number: '',
    address: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setEditForm({
          fullname: user.fullname || '',
          phone_number: user.phone_number || '',
          address: user.address || ''
        });
        setIsDataLoaded(true);
      }
    };

    loadUserData();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('refresh_token');
      
      if (!token) {
        toast.error('Không tìm thấy token xác thực');
        setIsLoading(false);
        return;
      }

      console.log('Updating profile with data:', editForm);

      // Gọi API cập nhật profile
      const response = await axios.put(
        `${baseUrl}/reptitist/auth/profile`,
        {
          fullname: editForm.fullname.trim(),
          phone_number: editForm.phone_number.trim(),
          address: editForm.address.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Profile update response:', response.data);

      if (response.status === 200) {
        // Cập nhật user data trong context
        updateUser(response.data);
        
        // Cập nhật localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        setIsEditing(false);
        
        toast.success('Cập nhật thông tin thành công!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }

    } catch (error) {
      console.error('Profile update error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi cập nhật thông tin';
      
      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Dữ liệu không hợp lệ';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        fullname: user.fullname || '',
        phone_number: user.phone_number || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = () => {
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('vi-VN', options).toUpperCase();
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(balance || 0);
  };

  const validateForm = () => {
    const errors = [];
    
    if (editForm.fullname.trim() && editForm.fullname.trim().length < 2) {
      errors.push('Tên đầy đủ phải có ít nhất 2 ký tự');
    }
    
    if (editForm.phone_number.trim() && !/^[0-9+\-\s()]+$/.test(editForm.phone_number.trim())) {
      errors.push('Số điện thoại không hợp lệ');
    }
    
    if (errors.length > 0) {
      toast.error(errors.join(', '), {
        position: "top-right",
        autoClose: 5000
      });
      return false;
    }
    
    return true;
  };

  const handleSaveWithValidation = () => {
    if (validateForm()) {
      handleSave();
    }
  };

  const handleUpgradeClick = () => {
    navigate('/upgrade-plan');
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Validate image file
  const validateImageFile = (file) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, GIF, WebP)' };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'Kích thước ảnh không được vượt quá 5MB' };
    }

    return { isValid: true };
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      console.log('Converting image to base64...');

      const token = localStorage.getItem('refresh_token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      // Send base64 data to backend
      const response = await axios.post(
        `${baseUrl}/reptitist/auth/upload-avatar`,
        {
          imageData: base64Data
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 && response.data.imageUrl) {
        // Update user data in context and localStorage
        const updatedUser = { ...user, user_imageurl: response.data.imageUrl };
        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Cập nhật ảnh đại diện thành công!');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi tải lên ảnh đại diện';
      
      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Kích thước file quá lớn';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getAvatarUrl = (user) => {
      if (!user?.imageUrl) return "/default-avatar.png";
    
    // If it's a base64 string, return as is
    if (user?.imageUrl.startsWith('data:image/')) {
      return user.imageUrl;
    }
    
    // If it's a regular URL, return as is
    if (user?.imageUrl.startsWith('http')) {
      return uimageUrl;
    }
    const defaultAvatar = '/default-avatar.png';
    
    // If it's a path, construct full URL
    return `${baseUrl}${user.imageUrl || defaultAvatar}`;
  };

  // Helper function to get user account type display
  const getUserAccountTypeDisplay = () => {
    if (!user) return 'Customer';
    
    // Check role first for admin
    if (hasRole('admin')) {
      return 'Administrator';
    }
    
    // Check account_type for shop
    if (user.account_type?.type === 'shop') {
      const level = user.account_type?.level;
      if (level === 'premium') {
        return 'Premium Shop Partner';
      } else {
        return 'Shop Partner';
      }
    }
    
    // Check account type level for customers
    if (user.account_type?.level === 'premium') {
      return 'Premium Customer';
    }
    
    return 'Customer';
  };

  // Helper function to check if user should see upgrade option
  const shouldShowUpgrade = () => {
    if (!user) return false;
    
    // Don't show upgrade for admin
    if (hasRole('admin')) return false;
    
    // Don't show upgrade if already shop or premium
    if (user.account_type?.type === 'shop') return false;
    if (user.account_type?.level === 'premium') return false;
    
    return true;
  };

  // Check if user is shop
  const isShop = () => {
    return user?.account_type?.type === 'shop';
  };

  if (!user || !isDataLoaded) {
    return (
      <>
        <Header />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div className="profile-layout">
          <NavigationBar />
          <div className="profile-container">
            <div className="welcome-header">
              <div className="welcome-content">
                <h1>Đang tải thông tin...</h1>
                <p>Vui lòng đợi trong giây lát</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="profile-layout">
        <NavigationBar />
        
        <div className="profile-container">
          {/* Welcome Header */}
          <div className="welcome-header">
            <div className="welcome-content">
              <h1>Xin chào, {user.fullname || user.username}</h1>
              <p>{formatDate()}</p>
            </div>
            <div className="welcome-emoji">
              🐢
            </div>
          </div>

          {/* Profile Section */}
          <div className="profile-section">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-user-info">
                <div 
                  className={`profile-avatar ${isUploading ? 'uploading' : ''}`}
                  onClick={triggerFileInput} 
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={getAvatarUrl(user)}
                    alt="Profile"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/64/64";
                    }}
                  />
                  <div className="avatar-overlay">
                    <span>{isUploading ? 'Đang tải lên...' : 'Thay đổi ảnh'}</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={isUploading}
                  />
                </div>
                <div className="profile-user-details">
                  <h2>{user.username}</h2>
                  {shouldShowUpgrade() ? (
                    <Link to="/PlanUpgrade" className="profile-badge-container">
                      <span className="profile-badge-text">{getUserAccountTypeDisplay()}</span>
                      <span className="upgrade-button">Upgrade account</span>
                    </Link>
                  ) : (
                    <div className="profile-badge-container">
                      <span className="profile-badge-text">{getUserAccountTypeDisplay()}</span>
                      {isShop() && (
                        <span className="shop-features-link">
                          <Link to="/ProductManagement">Quản lý cửa hàng</Link>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="edit-button" 
                  onClick={isEditing ? handleSaveWithValidation : handleEdit}
                  disabled={isLoading}
                  style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Đang lưu...' : (isEditing ? 'Lưu' : 'Chỉnh sửa')}
                </button>
                {isEditing && (
                  <button 
                    className="edit-button" 
                    onClick={handleCancel}
                    disabled={isLoading}
                    style={{ 
                      marginLeft: '0px', 
                      backgroundColor: '#6b7280',
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="profile-grid">
              {/* Left Column */}
              <div className="profile-column">
                <div className="profile-field">
                  <label>Tên đầy đủ</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullname"
                      value={editForm.fullname}
                      onChange={handleInputChange}
                      placeholder="Nhập tên đầy đủ"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: isLoading ? '#f3f4f6' : 'white'
                      }}
                    />
                  ) : (
                    <p>{user.fullname || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="profile-field">
                  <label>Email</label>
                  <p style={{ 
                    backgroundColor: '#f3f4f6', 
                    color: '#6b7280',
                    fontStyle: 'italic' 
                  }}>
                    {user.email}
                  </p>
                </div>

                <div className="profile-field">
                  <label>Số điện thoại</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone_number"
                      value={editForm.phone_number}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: isLoading ? '#f3f4f6' : 'white'
                      }}
                    />
                  ) : (
                    <p>{user.phone_number || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="profile-column">
                <div className="profile-field">
                  <label>Địa chỉ</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Nhập địa chỉ"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        resize: 'vertical',
                        backgroundColor: isLoading ? '#f3f4f6' : 'white'
                      }}
                    />
                  ) : (
                    <p>{user.address || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="profile-field wallet">
                  <label>Wallet</label>
                  <p>{formatBalance(user.wallet?.balance)}</p>
                </div>

                <div className="profile-field">
                  <label>Trạng thái tài khoản</label>
                  <span className="status-badge">
                    {user.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Type Information */}
            {isShop() && (
              <div className="account-type-section">
                <h3 className="section-title">Thông tin đối tác</h3>
                <div className="account-type-info">
                  <div className="account-type-item">
                    <span className="account-type-label">Loại tài khoản:</span>
                    <span className="account-type-value">
                      {user.account_type?.level === 'premium' ? 'Premium Shop Partner' : 'Shop Partner'}
                    </span>
                  </div>
                  {user.account_type?.activated_at && (
                    <div className="account-type-item">
                      <span className="account-type-label">Ngày kích hoạt:</span>
                      <span className="account-type-value">
                        {new Date(user.account_type.activated_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {user.account_type?.expires_at && (
                    <div className="account-type-item">
                      <span className="account-type-label">Ngày hết hạn:</span>
                      <span className="account-type-value">
                        {new Date(user.account_type.expires_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Information Section */}
            <div className="delivery-section">
              <h3 className="delivery-title">Thông tin nhận hàng</h3>
              
              <div className="delivery-info">
                <div className="delivery-content">
                  <div className="delivery-icon">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div className="delivery-details">
                    <p>{user.fullname || user.username} - {user.phone_number || 'Chưa có SĐT'}</p>
                    <p>{user.address || 'Chưa cập nhật địa chỉ'}</p>
                  </div>
                </div>
              </div>

              <button className="add-info-button">
                <span>+</span>
                thông tin nhận
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;