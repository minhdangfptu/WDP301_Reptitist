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

      // Prepare form data
      const submitData = {
        product_name: formData.product_name.trim(),
        product_description: formData.product_description.trim(),
        product_price: parseInt(formData.product_price),
        product_quantity: parseInt(formData.product_quantity),
        product_category_id: formData.product_category_id,
        product_imageurl: formData.product_imageurl.trim(),
        product_status: formData.product_status || 'available'
      };

      console.log('Submitting data:', submitData);

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
                      className={`pf-input ${errors.product_name ? 'pf-input-error' : ''}`}
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
                    <input
                      type="text"
                      name="product_price"
                      value={formData.product_price}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`pf-input ${errors.product_price ? 'pf-input-error' : ''}`}
                      placeholder="Nhập giá sản phẩm..."
                    />
                    {errors.product_price && (
                      <span className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_price}
                      </span>
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
                      className={`pf-input ${errors.product_quantity ? 'pf-input-error' : ''}`}
                      placeholder="Nhập số lượng..."
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
                      className={`pf-select ${errors.product_category_id ? 'pf-input-error' : ''}`}
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
                      className={`pf-textarea ${errors.product_description ? 'pf-input-error' : ''}`}
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
                    <small className="pf-field-hint">
                      {formData.product_description.length}/1000 ký tự
                    </small>
                  </div>

                  {/* Product Image */}
                  <div className="pf-form-group pf-form-group-full">
                    <label className="pf-label pf-required">
                      <i className="fas fa-image"></i>
                      Hình ảnh sản phẩm
                    </label>
                    <input
                      type="url"
                      name="product_imageurl"
                      value={formData.product_imageurl}
                      onChange={handleImageUrlChange}
                      onBlur={handleBlur}
                      className={`pf-input ${errors.product_imageurl ? 'pf-input-error' : ''}`}
                      placeholder="Nhập URL hình ảnh sản phẩm..."
                    />
                    {errors.product_imageurl && (
                      <span className="pf-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.product_imageurl}
                      </span>
                    )}
                    
                    {/* Image Preview */}
                    {previewImage && (
                      <div className="pf-image-preview">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          onError={() => setPreviewImage('')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pf-form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/ShopProductManagement')}
                  className="pf-btn pf-btn-secondary"
                  disabled={loading}
                >
                  <i className="fas fa-times"></i>
                  Hủy bỏ
                </button>
                
                <button
                  type="submit"
                  className="pf-btn pf-btn-primary"
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
          </form>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ShopAddProductPage;