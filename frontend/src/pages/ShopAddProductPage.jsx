import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/ProductForm.css';
import { baseUrl } from '../config';

const ShopAddProductPage = () => {
  const { user, canSellProduct } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  
  // Form states
  const [formData, setFormData] = useState({
    product_name: '',
    product_description: '',
    product_price: '',
    product_quantity: '',
    product_category_id: '',
    product_imageurl: '',
    product_status: 'available' 
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [previewImage, setPreviewImage] = useState('');
  
  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageSource, setImageSource] = useState(''); // 'url' or 'file'
  const fileInputRef = useRef(null);

  // Form validation rules
  const validationRules = {
    product_name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ỹ0-9\s\-.,()&]+$/
    },
    product_description: {
      maxLength: 1000
    },
    product_price: {
      required: true,
      min: 1000,
      max: 1000000000,
      pattern: /^\d+$/
    },
    product_quantity: {
      required: true,
      min: 0,
      max: 999999,
      pattern: /^\d+$/
    },
    product_category_id: {
      required: true
    },
    product_imageurl: {
      pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    }
  };

  // Check shop permission
  useEffect(() => {
    if (!canSellProduct()) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    initializeForm();
  }, [canSellProduct, navigate, productId]);

  // Initialize form data
  const initializeForm = async () => {
    try {
      await fetchCategories();
      
      if (isEdit) {
        await fetchProductData();
      }
    } catch (error) {
      console.error('Error initializing form:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setPageLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/reptitist/shop/category`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
      setCategories([]);
    }
  }, []);

  // Fetch product data for editing
  const fetchProductData = async () => {
    try {
      setPageLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/Login');
        return;
      }

      const response = await axios.get(
        `${baseUrl}/reptitist/shop/my-products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const product = response.data;
      
      if (product) {
        const imageUrl = Array.isArray(product.product_imageurl) 
          ? product.product_imageurl[0] || '' 
          : product.product_imageurl || '';

        setFormData({
          product_name: product.product_name || '',
          product_description: product.product_description || '',
          product_price: product.product_price ? product.product_price.toString() : '',
          product_quantity: product.product_quantity ? product.product_quantity.toString() : '',
          product_category_id: product.product_category_id?._id || product.product_category_id || '',
          product_imageurl: imageUrl,
          product_status: product.product_status || 'available'
        });
        
        setPreviewImage(imageUrl);
        if (imageUrl) {
          setImageSource('url');
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      navigate('/ShopProductManagement');
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numeric fields
    if (name === 'product_price' || name === 'product_quantity') {
      // Allow only numbers
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Handle image URL change
  const handleImageUrlChange = (e) => {
    const value = e.target.value;
    
    // If user types in URL field, clear file upload
    if (value) {
      setImageFile(null);
      setImageSource('url');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setImageSource('');
    }
    
    setFormData(prev => ({
      ...prev,
      product_imageurl: value
    }));
    setPreviewImage(value);
    
    // Clear error
    if (errors.product_imageurl) {
      setErrors(prev => ({
        ...prev,
        product_imageurl: ''
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file ảnh: JPG, PNG, GIF, WebP');
      e.target.value = '';
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Kích thước file không được vượt quá 5MB');
      e.target.value = '';
      return;
    }
    
    // Clear URL input when file is selected
    setFormData(prev => ({
      ...prev,
      product_imageurl: ''
    }));
    setImageSource('file');
    
    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setImageFile(base64String);
      setPreviewImage(base64String);
      
      // Clear errors
      setErrors(prev => ({
        ...prev,
        product_imageurl: ''
      }));
    };
    
    reader.onerror = () => {
      toast.error('Có lỗi xảy ra khi đọc file');
      e.target.value = '';
    };
    
    reader.readAsDataURL(file);
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setPreviewImage('');
    setImageSource('');
    setFormData(prev => ({
      ...prev,
      product_imageurl: ''
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Set error if no image
    setErrors(prev => ({
      ...prev,
      product_imageurl: 'Vui lòng chọn hình ảnh sản phẩm'
    }));
  };

  // Handle blur event for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validate field
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && !value) {
      return 'Vui lòng nhập thông tin này';
    }

    if (value) {
      if (rules.minLength && value.length < rules.minLength) {
        return `Tối thiểu ${rules.minLength} ký tự`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Tối đa ${rules.maxLength} ký tự`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        if (name === 'product_price' || name === 'product_quantity') {
          return 'Vui lòng nhập số nguyên dương';
        }
        if (name === 'product_imageurl') {
          return 'URL hình ảnh không hợp lệ';
        }
        return 'Giá trị không hợp lệ';
      }

      if (rules.min !== undefined && parseInt(value) < rules.min) {
        return `Giá trị tối thiểu là ${rules.min.toLocaleString('vi-VN')}`;
      }

      if (rules.max !== undefined && parseInt(value) > rules.max) {
        return `Giá trị tối đa là ${rules.max.toLocaleString('vi-VN')}`;
      }
    }

    return '';
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate all required fields
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Additional validations
    if (formData.product_category_id && !categories.find(cat => cat._id === formData.product_category_id)) {
      newErrors.product_category_id = 'Danh mục không tồn tại';
    }

    // Image validation - require either URL or file
    if (!formData.product_imageurl && !imageFile) {
      newErrors.product_imageurl = 'Vui lòng nhập URL hình ảnh hoặc tải lên một ảnh sản phẩm';
    }

    console.log('Validation Errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/Login');
        return;
      }

      // Prepare image data - use file upload if available, otherwise use URL
      const imageData = imageFile || formData.product_imageurl.trim();

      // Prepare form data
      const submitData = {
        product_name: formData.product_name.trim(),
        product_description: formData.product_description.trim(),
        product_price: parseInt(formData.product_price),
        product_quantity: parseInt(formData.product_quantity),
        product_category_id: formData.product_category_id,
        product_imageurl: imageData,
        product_status: formData.product_status || 'available'
      };

      console.log('Submitting data:', {
        ...submitData,
        product_imageurl: imageData ? (imageData.startsWith('data:') ? '[Base64 Image Data]' : imageData) : ''
      });

      let response;
      if (isEdit) {
        // Update existing product
        response = await axios.put(
          `${baseUrl}/reptitist/shop/my-products/${productId}`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new product
        response = await axios.post(
          `${baseUrl}/reptitist/shop/products/create`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        navigate('/ShopProductManagement');
      }

    } catch (error) {
      console.error('Submit error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi xử lý yêu cầu';
      
      if (error.response) {
        // Server responded with error
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ';
            break;
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn';
            navigate('/Login');
            return;
          case 403:
            errorMessage = 'Bạn không có quyền thực hiện thao tác này';
            break;
          case 500:
            errorMessage = 'Lỗi server. Vui lòng thử lại sau';
            break;
          default:
            errorMessage = error.response.data?.message || 'Có lỗi xảy ra';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (pageLoading) {
    return (
      <>
        <Header />
        <div className="pf-container">
          <div className="pf-loading-state">
            <div className="pf-spinner"></div>
            <h3>Đang tải dữ liệu...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // No access state
  if (!canSellProduct()) {
    return (
      <>
        <Header />
        <div className="pf-container">
          <div className="pf-no-access">
            <i className="fas fa-exclamation-triangle pf-warning-icon"></i>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền thêm sản phẩm. Chỉ có Shop mới có thể sử dụng tính năng này.</p>
            <Link to="/" className="pf-btn pf-btn-primary">
              <i className="fas fa-home"></i>
              Về trang chủ
            </Link>
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
      
      <div className="pf-container">
        {/* Page Header */}
        <div className="pf-page-header">
          <div className="pf-page-header-content">
            <div className="pf-page-header-text">
              <h1>
                <i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h1>
              <p>
                {isEdit 
                  ? 'Cập nhật thông tin sản phẩm trong cửa hàng của bạn'
                  : 'Tạo sản phẩm mới để bán trong cửa hàng của bạn'
                }
              </p>
              <div className="pf-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <Link to="/ShopProductManagement">Quản lý sản phẩm</Link>
                <i className="fas fa-chevron-right"></i>
                <span>{isEdit ? 'Chỉnh sửa' : 'Thêm mới'}</span>
              </div>
            </div>
            <div className="pf-header-actions">
              <Link to="/ShopProductManagement" className="pf-btn pf-btn-secondary">
                <i className="fas fa-arrow-left"></i>
                Quay lại
              </Link>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="pf-form-section">
          <form onSubmit={handleSubmit} className="pf-form" noValidate>
            <div className="pf-form-container">
              
              {/* Product Information */}
              <div className="pf-form-group-section">
                <h3 className="pf-section-title">
                  <i className="fas fa-info-circle"></i>
                  Thông tin cơ bản
                </h3>
                
                <div className="pf-form-grid">
                  {/* Product Name */}
                  <div className="pf-form-group pf-form-group-full">
                    <label className="pf-label pf-required">
                      <i className="fas fa-tag"></i>
                      Tên sản phẩm
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`pf-input ${errors.product_name ? 'pf-error' : ''}`}
                      placeholder="Nhập tên sản phẩm..."
                      maxLength="100"
                    />
                    {errors.product_name && (
                      <span className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_name}
                      </span>
                    )}
                  </div>

                  {/* Product Price */}
                  <div className="pf-form-group">
                    <label className="pf-label pf-required">
                      <i className="fas fa-money-bill-wave"></i>
                      Giá bán (VNĐ)
                    </label>
                    <div className="pf-input-wrapper">
                      <input
                        type="text"
                        name="product_price"
                        value={formData.product_price}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`pf-input pf-input-price ${errors.product_price ? 'pf-error' : ''}`}
                        placeholder="0"
                      />
                      <span className="pf-input-suffix">VNĐ</span>
                    </div>
                    {errors.product_price && (
                      <span className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_price}
                      </span>
                    )}
                    {formData.product_price && !errors.product_price && (
                      <small className="pf-input-info">
                        ≈ {parseInt(formData.product_price).toLocaleString('vi-VN')} VNĐ
                      </small>
                    )}
                  </div>

                  {/* Product Quantity */}
                  <div className="pf-form-group">
                    <label className="pf-label pf-required">
                      <i className="fas fa-boxes"></i>
                      Số lượng
                    </label>
                    <input
                      type="text"
                      name="product_quantity"
                      value={formData.product_quantity}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`pf-input ${errors.product_quantity ? 'pf-error' : ''}`}
                      placeholder="0"
                    />
                    {errors.product_quantity && (
                      <span className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_quantity}
                      </span>
                    )}
                  </div>

                  {/* Product Category */}
                  <div className="pf-form-group pf-form-group-full">
                    <label className="pf-label pf-required">
                      <i className="fas fa-list"></i>
                      Danh mục sản phẩm
                    </label>
                    <select
                      name="product_category_id"
                      value={formData.product_category_id}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`pf-select ${errors.product_category_id ? 'pf-error' : ''}`}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.product_category_name}
                        </option>
                      ))}
                    </select>
                    {errors.product_category_id && (
                      <span className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_category_id}
                      </span>
                    )}
                  </div>

                  {/* Product Description */}
                  <div className="pf-form-group pf-form-group-full">
                    <label className="pf-label">
                      <i className="fas fa-align-left"></i>
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      name="product_description"
                      value={formData.product_description}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`pf-textarea ${errors.product_description ? 'pf-error' : ''}`}
                      placeholder="Nhập mô tả chi tiết về sản phẩm..."
                      rows="4"
                      maxLength="1000"
                    ></textarea>
                    {errors.product_description && (
                      <span className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_description}
                      </span>
                    )}
                    <small className="pf-input-info">
                      {formData.product_description.length}/1000 ký tự
                    </small>
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div className="pf-form-group-section">
                <h3 className="pf-section-title">
                  <i className="fas fa-image"></i>
                  Hình ảnh sản phẩm
                </h3>
                
                <div className="pf-image-section">
                  <div className="pf-image-upload">
                    {/* Upload Methods */}
                    <div className="pf-upload-methods">
                      {/* Method 1: Upload from computer */}
                      <div className="pf-upload-method">
                        <label className="pf-label">
                          <i className="fas fa-upload"></i>
                          Tải ảnh từ máy tính
                        </label>
                        <div className="pf-file-upload">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="pf-file-input"
                            disabled={imageSource === 'url'}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="pf-btn pf-upload-btn"
                            disabled={imageSource === 'url'}
                          >
                            <i className="fas fa-cloud-upload-alt"></i>
                            {imageSource === 'url' ? 'Vui lòng xóa URL trước' : 'Chọn file ảnh'}
                          </button>
                        </div>
                        <div className="pf-upload-info">
                          <small>Hỗ trợ: JPG, PNG, GIF, WebP. Tối đa 5MB</small>
                        </div>
                      </div>

                      <div className="pf-upload-divider">
                        <span>HOẶC</span>
                      </div>

                      {/* Method 2: URL input */}
                      <div className="pf-upload-method">
                        <label className="pf-label">
                          <i className="fas fa-link"></i>
                          Nhập URL hình ảnh
                        </label>
                        <input
                          type="url"
                          name="product_imageurl"
                          value={formData.product_imageurl}
                          onChange={handleImageUrlChange}
                          onBlur={handleBlur}
                          className={`pf-input ${errors.product_imageurl ? 'pf-error' : ''}`}
                          placeholder="https://example.com/image.jpg"
                          disabled={imageSource === 'file'}
                        />
                        {imageSource === 'file' && (
                          <small className="pf-input-info pf-warning">
                            <i className="fas fa-info-circle"></i>
                            Bạn đang sử dụng ảnh upload. Xóa ảnh để nhập URL.
                          </small>
                        )}
                      </div>
                    </div>

                    {errors.product_imageurl && (
                      <div className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_imageurl}
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  <div className="pf-image-preview-section">
                    <div className="pf-image-preview">
                      {previewImage ? (
                        <div className="pf-preview-container">
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="pf-preview-image"
                            onError={() => {
                              setPreviewImage('');
                              if (imageSource === 'url') {
                                setErrors(prev => ({
                                  ...prev,
                                  product_imageurl: 'Không thể tải ảnh từ URL này'
                                }));
                              }
                            }}
                          />
                          <div className="pf-preview-overlay">
                            <button
                              type="button"
                              onClick={removeImage}
                              className="pf-btn pf-btn-danger pf-remove-image"
                              title="Xóa ảnh"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          <div className="pf-preview-info">
                            {imageSource === 'file' ? 'Ảnh từ máy tính' : 'Ảnh từ URL'}
                          </div>
                        </div>
                      ) : (
                        <div className="pf-no-preview">
                          <i className="fas fa-image"></i>
                          <p>Chưa có ảnh</p>
                          <small>Tải lên ảnh hoặc nhập URL</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pf-form-actions">
                <div className="pf-actions-left">
                  <button
                    type="button"
                    onClick={() => navigate('/ShopProductManagement')}
                    className="pf-btn pf-btn-secondary"
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i>
                    Hủy bỏ
                  </button>
                </div>
                
                <div className="pf-actions-right">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        product_name: '',
                        product_description: '',
                        product_price: '',
                        product_quantity: '',
                        product_category_id: '',
                        product_imageurl: '',
                        product_status: 'available'
                      });
                      setImageFile(null);
                      setPreviewImage('');
                      setImageSource('');
                      setErrors({});
                      setTouched({});
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="pf-btn pf-btn-reset"
                    disabled={loading}
                  >
                    <i className="fas fa-undo"></i>
                    Đặt lại
                  </button>
                  
                  <button
                    type="submit"
                    className="pf-btn pf-btn-primary pf-btn-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        {isEdit ? 'Đang cập nhật...' : 'Đang thêm...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'}`}></i>
                        {isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                      </>
                    )}
                  </button>
                </div>
              </div>


            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ShopAddProductPage;