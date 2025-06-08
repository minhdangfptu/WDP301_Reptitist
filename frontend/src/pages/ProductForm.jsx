import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/ProductForm.css';

const ProductForm = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditMode = Boolean(productId);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_name: '',
    product_price: '',
    product_description: '',
    product_imageurl: [''],
    product_category_id: '',
    product_quantity: '',
    product_status: 'pending'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check admin permission
  useEffect(() => {
    if (!hasRole('admin')) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    fetchCategories();
    if (isEditMode) {
      fetchProductData();
    }
  }, [hasRole, isEditMode, productId]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/reptitist/shop/category');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    }
  };

  // Fetch product data for edit mode
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/reptitist/shop/products/detail/${productId}`
      );
      
      const product = response.data;
      setFormData({
        product_name: product.product_name || '',
        product_price: product.product_price || '',
        product_description: product.product_description || '',
        product_imageurl: product.product_imageurl || [''],
        product_category_id: product.product_category_id || '',
        product_quantity: product.product_quantity || '',
        product_status: product.product_status || 'pending'
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.product_imageurl];
    newImageUrls[index] = value;
    setFormData(prev => ({
      ...prev,
      product_imageurl: newImageUrls
    }));
  };

  // Add new image URL field
  const addImageUrlField = () => {
    if (formData.product_imageurl.length < 5) {
      setFormData(prev => ({
        ...prev,
        product_imageurl: [...prev.product_imageurl, '']
      }));
    }
  };

  // Remove image URL field
  const removeImageUrlField = (index) => {
    if (formData.product_imageurl.length > 1) {
      const newImageUrls = formData.product_imageurl.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        product_imageurl: newImageUrls
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Tên sản phẩm không được để trống';
    }

    if (!formData.product_price || formData.product_price <= 0) {
      newErrors.product_price = 'Giá sản phẩm phải lớn hơn 0';
    }

    if (!formData.product_category_id) {
      newErrors.product_category_id = 'Vui lòng chọn danh mục';
    }

    if (!formData.product_quantity || formData.product_quantity < 0) {
      newErrors.product_quantity = 'Số lượng phải lớn hơn hoặc bằng 0';
    }

    // Validate at least one image URL
    const validImageUrls = formData.product_imageurl.filter(url => url.trim());
    if (validImageUrls.length === 0) {
      newErrors.product_imageurl = 'Vui lòng thêm ít nhất một hình ảnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty image URLs
      const validImageUrls = formData.product_imageurl.filter(url => url.trim());
      
      const submitData = {
        ...formData,
        product_imageurl: validImageUrls,
        product_price: parseFloat(formData.product_price),
        product_quantity: parseInt(formData.product_quantity),
        user_id: user.id // Add user_id for create mode
      };

      let response;
      if (isEditMode) {
        response = await axios.put(
          `http://localhost:8080/reptitist/shop/products/${productId}`,
          submitData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        response = await axios.post(
          'http://localhost:8080/reptitist/shop/products/create',
          submitData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(
          isEditMode ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!',
          { autoClose: 2000 }
        );
        
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(
        error.response?.data?.message || 
        `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'tạo'} sản phẩm`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.product_category_name : '';
  };

  // Check admin access
  if (!hasRole('admin')) {
    return (
      <>
        <Header />
        <div className="pf-container">
          <div className="pf-no-access">
            <i className="fas fa-exclamation-triangle pf-warning-icon"></i>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền xem trang này. Chỉ có Admin mới có thể truy cập.</p>
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

  if (loading) {
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
                <i className={`fas ${isEditMode ? 'fa-edit' : 'fa-plus'}`}></i>
                {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h1>
              <p>
                {isEditMode 
                  ? 'Cập nhật thông tin sản phẩm trong hệ thống'
                  : 'Thêm sản phẩm mới vào hệ thống quản lý'
                }
              </p>
              <div className="pf-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <Link to="/admin/products">Quản lý sản phẩm</Link>
                <i className="fas fa-chevron-right"></i>
                <span>{isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}</span>
              </div>
            </div>
            <div className="pf-header-actions">
              <Link to="/admin/products" className="pf-btn pf-btn-secondary">
                <i className="fas fa-arrow-left"></i>
                Quay lại
              </Link>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="pf-form-section">
          <div className="pf-form-container">
            <form onSubmit={handleSubmit} className="pf-form">
              {/* Basic Information */}
              <div className="pf-form-group-section">
                <h3 className="pf-section-title">
                  <i className="fas fa-info-circle"></i>
                  Thông tin cơ bản
                </h3>
                
                <div className="pf-form-row">
                  <div className="pf-form-group">
                    <label htmlFor="product_name" className="pf-form-label">
                      Tên sản phẩm <span className="pf-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="product_name"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      className={`pf-form-input ${errors.product_name ? 'pf-error' : ''}`}
                      placeholder="Nhập tên sản phẩm"
                      disabled={isSubmitting}
                    />
                    {errors.product_name && (
                      <span className="pf-error-message">{errors.product_name}</span>
                    )}
                  </div>

                  <div className="pf-form-group">
                    <label htmlFor="product_price" className="pf-form-label">
                      Giá sản phẩm (VNĐ) <span className="pf-required">*</span>
                    </label>
                    <input
                      type="number"
                      id="product_price"
                      name="product_price"
                      value={formData.product_price}
                      onChange={handleInputChange}
                      className={`pf-form-input ${errors.product_price ? 'pf-error' : ''}`}
                      placeholder="Nhập giá sản phẩm"
                      min="0"
                      step="1000"
                      disabled={isSubmitting}
                    />
                    {errors.product_price && (
                      <span className="pf-error-message">{errors.product_price}</span>
                    )}
                  </div>
                </div>

                <div className="pf-form-row">
                  <div className="pf-form-group">
                    <label htmlFor="product_category_id" className="pf-form-label">
                      Danh mục <span className="pf-required">*</span>
                    </label>
                    <select
                      id="product_category_id"
                      name="product_category_id"
                      value={formData.product_category_id}
                      onChange={handleInputChange}
                      className={`pf-form-select ${errors.product_category_id ? 'pf-error' : ''}`}
                      disabled={isSubmitting}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.product_category_name}
                        </option>
                      ))}
                    </select>
                    {errors.product_category_id && (
                      <span className="pf-error-message">{errors.product_category_id}</span>
                    )}
                  </div>

                  <div className="pf-form-group">
                    <label htmlFor="product_quantity" className="pf-form-label">
                      Số lượng <span className="pf-required">*</span>
                    </label>
                    <input
                      type="number"
                      id="product_quantity"
                      name="product_quantity"
                      value={formData.product_quantity}
                      onChange={handleInputChange}
                      className={`pf-form-input ${errors.product_quantity ? 'pf-error' : ''}`}
                      placeholder="Nhập số lượng"
                      min="0"
                      disabled={isSubmitting}
                    />
                    {errors.product_quantity && (
                      <span className="pf-error-message">{errors.product_quantity}</span>
                    )}
                  </div>
                </div>

                <div className="pf-form-group">
                  <label htmlFor="product_status" className="pf-form-label">
                    Trạng thái
                  </label>
                  <select
                    id="product_status"
                    name="product_status"
                    value={formData.product_status}
                    onChange={handleInputChange}
                    className="pf-form-select"
                    disabled={isSubmitting}
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="available">Đang bán</option>
                    <option value="not_available">Ngừng bán</option>
                  </select>
                </div>

                <div className="pf-form-group">
                  <label htmlFor="product_description" className="pf-form-label">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    id="product_description"
                    name="product_description"
                    value={formData.product_description}
                    onChange={handleInputChange}
                    className="pf-form-textarea"
                    placeholder="Nhập mô tả chi tiết về sản phẩm"
                    rows="4"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Images Section */}
              <div className="pf-form-group-section">
                <h3 className="pf-section-title">
                  <i className="fas fa-images"></i>
                  Hình ảnh sản phẩm
                </h3>
                
                <div className="pf-images-container">
                  {formData.product_imageurl.map((url, index) => (
                    <div key={index} className="pf-image-input-group">
                      <label className="pf-form-label">
                        Hình ảnh {index + 1} {index === 0 && <span className="pf-required">*</span>}
                      </label>
                      <div className="pf-image-input-container">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                          className="pf-form-input"
                          placeholder="Nhập URL hình ảnh"
                          disabled={isSubmitting}
                        />
                        {formData.product_imageurl.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageUrlField(index)}
                            className="pf-btn-remove-image"
                            disabled={isSubmitting}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                      {url && (
                        <div className="pf-image-preview">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/api/placeholder/150/150";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {errors.product_imageurl && (
                    <span className="pf-error-message">{errors.product_imageurl}</span>
                  )}

                  {formData.product_imageurl.length < 5 && (
                    <button
                      type="button"
                      onClick={addImageUrlField}
                      className="pf-btn pf-btn-secondary pf-add-image-btn"
                      disabled={isSubmitting}
                    >
                      <i className="fas fa-plus"></i>
                      Thêm hình ảnh
                    </button>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pf-form-actions">
                <button
                  type="submit"
                  className="pf-btn pf-btn-primary pf-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="pf-btn-spinner"></div>
                      {isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${isEditMode ? 'fa-save' : 'fa-plus'}`}></i>
                      {isEditMode ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
                    </>
                  )}
                </button>
                
                <Link
                  to="/admin/products"
                  className="pf-btn pf-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Hủy bỏ
                </Link>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          {(formData.product_name || formData.product_price) && (
            <div className="pf-preview-section">
              <h3 className="pf-section-title">
                <i className="fas fa-eye"></i>
                Xem trước
              </h3>
              
              <div className="pf-product-preview">
                <div className="pf-preview-image">
                  <img
                    src={formData.product_imageurl[0] || "/api/placeholder/200/200"}
                    alt="Preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/200/200";
                    }}
                  />
                </div>
                <div className="pf-preview-info">
                  <h4 className="pf-preview-name">
                    {formData.product_name || 'Tên sản phẩm'}
                  </h4>
                  <p className="pf-preview-price">
                    {formData.product_price 
                      ? new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(formData.product_price)
                      : '0 VNĐ'
                    }
                  </p>
                  <p className="pf-preview-category">
                    Danh mục: {getCategoryName(formData.product_category_id) || 'Chưa chọn'}
                  </p>
                  <p className="pf-preview-quantity">
                    Số lượng: {formData.product_quantity || 0}
                  </p>
                  <span className={`pf-preview-status pf-status-${formData.product_status}`}>
                    {formData.product_status === 'available' ? 'Đang bán' : 
                     formData.product_status === 'pending' ? 'Chờ duyệt' : 'Ngừng bán'}
                  </span>
                  {formData.product_description && (
                    <p className="pf-preview-description">
                      {formData.product_description.length > 100
                        ? formData.product_description.substring(0, 100) + '...'
                        : formData.product_description
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductForm;