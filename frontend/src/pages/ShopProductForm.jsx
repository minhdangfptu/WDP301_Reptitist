import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/ProductForm.css';

const ShopProductForm = () => {
  const { user, hasRole } = useAuth();
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
    product_status: 'available' // Sản phẩm tự động available
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
  const fileInputRef = useRef(null);

  // Form validation rules
  const validationRules = {
    product_name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-ZÀ-ỹ0-9\s\-.,()&]+$/
    },
    product_description: {
      maxLength: 150
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
    initializeForm();
  }, [productId]);

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
      const response = await axios.get('http://localhost:8080/reptitist/shop/category');
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
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/shop/products');
        return;
      }

      const response = await axios.get(
        `http://localhost:8080/reptitist/shop/my-products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const product = response.data;
      
      if (product) {
        setFormData({
          product_name: product.product_name || '',
          product_description: product.product_description || '',
          product_price: product.product_price ? product.product_price.toString() : '',
          product_quantity: product.product_quantity ? product.product_quantity.toString() : '',
          product_category_id: product.product_category_id?._id || product.product_category_id || '',
          product_imageurl: Array.isArray(product.product_imageurl) 
            ? product.product_imageurl[0] || '' 
            : product.product_imageurl || '',
          product_status: product.product_status || 'available'
        });
        
        const imageUrl = Array.isArray(product.product_imageurl) 
          ? product.product_imageurl[0] || '' 
          : product.product_imageurl || '';
        setPreviewImage(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      navigate('/shop/products');
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numeric fields
    if (name === 'product_price' || name === 'product_quantity') {
      // Remove any non-digit characters
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
        return 'Giá trị không hợp lệ';
      }

      if (rules.min !== undefined && parseInt(value) < rules.min) {
        return `Giá trị tối thiểu là ${rules.min}`;
      }

      if (rules.max !== undefined && parseInt(value) > rules.max) {
        return `Giá trị tối đa là ${rules.max}`;
      }
    }

    return '';
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Check if category exists
    if (formData.product_category_id && !categories.find(cat => cat._id === formData.product_category_id)) {
      newErrors.product_category_id = 'Danh mục không tồn tại';
    }

    console.log('Validation Errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Handle image URL change
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    handleInputChange(e);
    
    if (url && validationRules.product_imageurl.pattern.test(url)) {
      setPreviewImage(url);
    } else {
      setPreviewImage('');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setImageUploading(true);
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);

      // Convert to base64 and save to MongoDB
      const base64 = await convertToBase64(file);
      setFormData(prev => ({
        ...prev,
        product_imageurl: base64
      }));

      toast.success('Tải ảnh thành công');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Có lỗi xảy ra khi tải ảnh');
    } finally {
      setImageUploading(false);
    }
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Remove image
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      product_imageurl: ''
    }));
    setPreviewImage('');
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/login');
        return;
      }
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        product_price: parseInt(formData.product_price),
        product_quantity: parseInt(formData.product_quantity),
        product_status: 'available', // Shop products are immediately available
        product_imageurl: formData.product_imageurl || '' // Make image optional
      };

      let response;
      if (isEdit) {
        // Update existing product
        response = await axios.put(
          `http://localhost:8080/reptitist/shop/my-products/${productId}`,
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
          'http://localhost:8080/reptitist/shop/products/create',
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
        toast.success(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!');
        
        // Redirect after delay
        setTimeout(() => {
          navigate('/shop/products');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
      } else if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền thực hiện hành động này');
      } else if (error.response?.status === 404) {
        toast.error(isEdit ? 'Không tìm thấy sản phẩm cần cập nhật' : 'Endpoint không tồn tại');
      } else if (error.response?.status === 500) {
        toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        toast.error(isEdit ? 'Có lỗi xảy ra khi cập nhật sản phẩm' : 'Có lỗi xảy ra khi tạo sản phẩm');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format number for display
  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get field error class
  const getFieldErrorClass = (fieldName) => {
    return errors[fieldName] && touched[fieldName] ? 'pf-error' : '';
  };

  // Reset form
  const resetForm = () => {
    if (isEdit) {
      // Reset to original product data
      fetchProductData();
    } else {
      // Reset to empty form
      setFormData({
        product_name: '',
        product_description: '',
        product_price: '',
        product_quantity: '',
        product_category_id: '',
        product_imageurl: '',
        product_status: 'available'
      });
      setPreviewImage('');
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    
    setErrors({});
    setTouched({});
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
                <Link to="/shop/products">Quản lý sản phẩm</Link>
                <i className="fas fa-chevron-right"></i>
                <span>{isEdit ? 'Chỉnh sửa' : 'Thêm mới'}</span>
              </div>
            </div>
            <div className="pf-header-actions">
              <Link to="/shop/products" className="pf-btn pf-btn-secondary">
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
                      onBlur={handleFieldBlur}
                      className={`pf-input ${getFieldErrorClass('product_name')}`}
                      placeholder="Nhập tên sản phẩm (2-50 ký tự)"
                      required
                    />
                    <div className="pf-input-info">
                      <span className="pf-char-count">
                        {formData.product_name.length}/50 ký tự
                      </span>
                    </div>
                    {errors.product_name && touched.product_name && (
                      <div className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_name}
                      </div>
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
                      onBlur={handleFieldBlur}
                      className={`pf-textarea ${getFieldErrorClass('product_description')}`}
                      placeholder="Nhập mô tả sản phẩm (tối đa 150 ký tự)"
                      rows="4"
                    />
                    <div className="pf-input-info">
                      <span className="pf-char-count">
                        {formData.product_description.length}/150 ký tự
                      </span>
                    </div>
                    {errors.product_description && touched.product_description && (
                      <div className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_description}
                      </div>
                    )}
                  </div>

                  {/* Price and Quantity */}
                  <div className="pf-form-group">
                    <label className="pf-label pf-required">
                      <i className="fas fa-dollar-sign"></i>
                      Giá bán (VNĐ)
                    </label>
                    <div className="pf-input-wrapper">
                      <input
                        type="text"
                        name="product_price"
                        value={formData.product_price ? formatNumber(formData.product_price) : ''}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
                        placeholder="0"
                        className={`pf-input pf-input-price ${getFieldErrorClass('product_price')}`}
                        required
                      />
                      <span className="pf-input-suffix">VNĐ</span>
                    </div>
                    {errors.product_price && touched.product_price && (
                      <div className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_price}
                      </div>
                    )}
                    {formData.product_price && !errors.product_price && (
                      <div className="pf-input-info">
                        {formatCurrency(parseInt(formData.product_price.replace(/,/g, '')))}
                      </div>
                    )}
                  </div>

                  <div className="pf-form-group">
                    <label className="pf-label pf-required">
                      <i className="fas fa-boxes"></i>
                      Số lượng
                    </label>
                    <input
                      type="number"
                      name="product_quantity"
                      value={formData.product_quantity}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="0"
                      className={`pf-input ${getFieldErrorClass('product_quantity')}`}
                      min="0"
                      max="999999"
                      required
                    />
                    {errors.product_quantity && touched.product_quantity && (
                      <div className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_quantity}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="pf-form-group">
                    <label className="pf-label pf-required">
                      <i className="fas fa-tags"></i>
                      Danh mục
                    </label>
                    <select
                      name="product_category_id"
                      value={formData.product_category_id}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      className={`pf-select ${getFieldErrorClass('product_category_id')}`}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.product_category_name}
                        </option>
                      ))}
                    </select>
                    {errors.product_category_id && touched.product_category_id && (
                      <div className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_category_id}
                      </div>
                    )}
                    {categories.length === 0 && (
                      <div className="pf-input-info pf-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        Chưa có danh mục nào. Vui lòng liên hệ admin để tạo danh mục.
                      </div>
                    )}
                  </div>

                  {/* Status - Read only for shop */}
                  <div className="pf-form-group">
                    <label className="pf-label">
                      <i className="fas fa-toggle-on"></i>
                      Trạng thái
                    </label>
                    <div className="pf-input-wrapper">
                      <input
                        type="text"
                        value="Đang bán"
                        className="pf-input"
                        disabled
                        style={{ backgroundColor: '#e8f5e8', color: '#166534' }}
                      />
                    </div>
                    <div className="pf-input-info">
                      Sản phẩm sẽ được hiển thị ngay sau khi tạo
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div className="pf-form-group-section">
                <h3 className="pf-section-title">
                  <i className="fas fa-images"></i>
                  Hình ảnh sản phẩm
                </h3>
                
                <div className="pf-image-section">
                  <div className="pf-image-upload">
                    <div className="pf-upload-methods">
                      {/* URL Input */}
                      <div className="pf-upload-method">
                        <label className="pf-label">
                          <i className="fas fa-link"></i>
                          URL hình ảnh
                        </label>
                        <input
                          type="url"
                          name="product_imageurl"
                          value={formData.product_imageurl.startsWith('data:') ? '' : formData.product_imageurl}
                          onChange={handleImageUrlChange}
                          onBlur={handleFieldBlur}
                          placeholder="https://example.com/image.jpg"
                          className={`pf-input ${getFieldErrorClass('product_imageurl')}`}
                          disabled={imageFile !== null}
                        />
                        {errors.product_imageurl && touched.product_imageurl && (
                          <div className="pf-error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.product_imageurl}
                          </div>
                        )}
                      </div>

                      <div className="pf-upload-divider">
                        <span>HOẶC</span>
                      </div>

                      {/* File Upload */}
                      <div className="pf-upload-method">
                        <label className="pf-label">
                          <i className="fas fa-upload"></i>
                          Tải lên từ máy tính
                        </label>
                        <div className="pf-file-upload">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="pf-file-input"
                            disabled={imageUploading}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="pf-btn pf-btn-secondary pf-upload-btn"
                            disabled={imageUploading}
                          >
                            {imageUploading ? (
                              <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Đang tải...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-cloud-upload-alt"></i>
                                Chọn ảnh
                              </>
                            )}
                          </button>
                        </div>
                        <div className="pf-upload-info">
                          <small>Hỗ trợ: JPG, PNG, GIF, WebP. Tối đa 5MB. Ảnh sẽ được lưu vào hệ thống.</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div className="pf-image-preview-section">
                    {previewImage ? (
                      <div className="pf-image-preview">
                        <div className="pf-preview-container">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="pf-preview-image"
                            onError={(e) => {
                              e.target.src = '/default-product.png';
                              toast.error('Không thể tải hình ảnh. Vui lòng kiểm tra URL.');
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
                        </div>
                        <div className="pf-preview-info">
                          <span>Ảnh xem trước</span>
                        </div>
                      </div>
                    ) : (
                      <div className="pf-no-preview">
                        <i className="fas fa-image"></i>
                        <p>Chưa có ảnh xem trước</p>
                        <small>Thêm URL hoặc tải ảnh lên để xem trước</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pf-form-actions">
                <div className="pf-actions-left">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="pf-btn pf-btn-secondary pf-btn-reset"
                    disabled={loading}
                  >
                    <i className="fas fa-undo"></i>
                    Đặt lại
                  </button>
                </div>

                <div className="pf-actions-right">
                  <Link
                    to="/shop/products"
                    className="pf-btn pf-btn-secondary"
                  >
                    <i className="fas fa-times"></i>
                    Hủy
                  </Link>

                  <button
                    type="submit"
                    className="pf-btn pf-btn-primary pf-btn-submit"
                    disabled={loading || categories.length === 0}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'}`}></i>
                        {isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
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

export default ShopProductForm;