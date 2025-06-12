import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Search, User, HelpCircle, Facebook, Star, Truck, Shield, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ reason: '', description: '' });
  const [submittingReport, setSubmittingReport] = useState(false);

  // Fetch product details
  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      
      // Fetch product details
      const productResponse = await axios.get(`http://localhost:8080/reptitist/shop/products/detail/${productId}`);
      const productData = productResponse.data;
      
      if (productData) {
        setProduct(productData);
        
        // Fetch related products
        if (productData.product_category_id) {
          fetchRelatedProducts(productData.product_category_id._id || productData.product_category_id);
        }
        
        // Fetch reviews
        fetchReviews();
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await axios.get(`http://localhost:8080/reptitist/shop/products/category/${categoryId}`);
      const related = response.data.filter(p => p._id !== productId).slice(0, 6);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/reptitist/shop/products-feedbacks/${productId}`);
      setReviews(response.data.feedbacks || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8080/reptitist/shop/cart/add-product',
        {
          product_id: productId,
          quantity: quantity
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success('Đã thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Vui lòng nhập bình luận');
      return;
    }

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:8080/reptitist/shop/products-feedbacks/${productId}`,
        {
          rating: newReview.rating,
          comment: newReview.comment
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        toast.success('Đánh giá thành công');
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
        fetchReviews();
        fetchProductDetail(); // Refresh to update average rating
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Submit report
  const handleSubmitReport = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để báo cáo');
      return;
    }

    if (!reportData.reason) {
      toast.error('Vui lòng chọn lý do báo cáo');
      return;
    }

    try {
      setSubmittingReport(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:8080/reptitist/shop/products/${productId}/report`,
        reportData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        toast.success('Báo cáo đã được gửi');
        setReportData({ reason: '', description: '' });
        setShowReportModal(false);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi báo cáo');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Render stars
  const renderStars = (rating, size = 'medium') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className={`product-detail-star-filled ${size === 'large' ? 'h-6 w-6' : 'h-4 w-4'}`} fill="currentColor" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className={`product-detail-star-filled ${size === 'large' ? 'h-6 w-6' : 'h-4 w-4'}`} fill="url(#half)" />);
      } else {
        stars.push(<Star key={i} className={`product-detail-star-empty ${size === 'large' ? 'h-6 w-6' : 'h-4 w-4'}`} />);
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="pd-page">
          <div className="pd-container">
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div style={{ fontSize: '18px' }}>Đang tải...</div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="pd-page">
          <div className="pd-container">
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div style={{ fontSize: '18px' }}>Không tìm thấy sản phẩm</div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const productImages = Array.isArray(product.product_imageurl) 
    ? product.product_imageurl 
    : product.product_imageurl 
      ? [product.product_imageurl] 
      : ['/default-product.png'];

  return (
    <>
      <Header />
      <ToastContainer />
      
      <div className="pd-page">
        {/* Header - Same as ShopLandingPage */}
        <header className="pd-header">
          <div className="pd-top-header">
            <div className="pd-top-links">
              <a href="#" className="pd-top-link">Kênh người bán</a>
              <a href="#" className="pd-top-link">Trở thành người bán trên Reptisist Shop</a>
              <a href="#" className="pd-top-link">Kết nối với chúng tôi</a>
              <div className="pd-social-icons">
                <a href="#" className="pd-social-icon">
                  <Facebook size={16} />
                </a>
              </div>
            </div>
            <div className="pd-top-actions">
              <a href="#" className="pd-top-action">
                <HelpCircle size={16} /> Hỗ trợ
              </a>
              <a href="#" className="pd-top-action">
                <User size={16} /> Tài khoản
              </a>
            </div>
          </div>
          
          <div className="pd-main-header">
            <div className="pd-logo-container">
              <img src="/logo1.png" alt="Reptisist Shop" className="pd-logo" />
              <h1 className="pd-shop-name">REPTISIST SHOP</h1>
            </div>
            
            <div className="pd-search-container">
              <input 
                type="text" 
                placeholder="Tìm sản phẩm, thương hiệu, hoặc tên shop" 
                className="pd-search-input"
              />
              <button className="pd-search-button">
                <Search size={18} />
              </button>
            </div>
            
            <Link to="/cart" className="pd-cart-container">
              <ShoppingCart className="pd-cart-icon" size={22} />
            </Link>
          </div>
          
          <nav className="pd-main-nav">
            <ul className="pd-nav-links">
              <li><Link to="/shop" className="pd-nav-link">Chuồng & phụ kiện chuồng</Link></li>
              <li><Link to="/shop" className="pd-nav-link">Thiết bị & dụng cụ nuôi</Link></li>
              <li><Link to="/shop" className="pd-nav-link">Thức ăn & Dinh dưỡng</Link></li>
              <li><Link to="/shop" className="pd-nav-link">Sản phẩm vệ sinh & chăm sóc sức khỏe</Link></li>
            </ul>
          </nav>
        </header>

        {/* Breadcrumb */}
        <div className="product-detail-breadcrumb">
          <div className="pd-container">
            <nav className="product-detail-nav">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <Link to="/shop">Shop</Link>
              <span>/</span>
              <span>{product.product_category_id?.product_category_name || 'Sản phẩm'}</span>
              <span>/</span>
              <span>{product.product_name}</span>
            </nav>
          </div>
        </div>

        {/* Product Main */}
        <div className="pd-container">
          <div className="product-detail-main">
            {/* Product Images */}
            <div className="product-detail-images">
              <div className="product-detail-main-image">
                <img 
                  src={productImages[selectedImage] || '/default-product.png'} 
                  alt={product.product_name}
                  onError={(e) => {
                    e.target.src = '/default-product.png';
                  }}
                />
                <div className="product-detail-image-actions">
                  <button 
                    className="product-detail-action-btn"
                    onClick={() => setShowReportModal(true)}
                    title="Báo cáo sản phẩm"
                  >
                    🚩
                  </button>
                </div>
              </div>
              
              {productImages.length > 1 && (
                <div className="product-detail-thumbnails">
                  {productImages.map((image, index) => (
                    <div 
                      key={index}
                      className={`product-detail-thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={image} alt={`${product.product_name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-detail-info">
              <h1 className="product-detail-title">{product.product_name}</h1>
              
              {/* Rating */}
              <div className="product-detail-rating">
                <div className="product-detail-rating-stars">
                  <span className="product-detail-rating-number">
                    {product.average_rating ? product.average_rating.toFixed(1) : '0.0'}
                  </span>
                  <div className="product-detail-stars">
                    {renderStars(product.average_rating || 0)}
                  </div>
                </div>
                <div className="product-detail-rating-stats">
                  <span className="product-detail-review-count">
                    {reviews.length} Đánh giá
                  </span>
                  <span className="product-detail-sold-count">Đã bán 0</span>
                </div>
              </div>

              {/* Price */}
              <div className="product-detail-price">
                <span className="product-detail-current-price">
                  {formatCurrency(product.product_price)}
                </span>
              </div>

              {/* Quantity */}
              <div className="product-detail-quantity">
                <label className="product-detail-quantity-label">Số lượng</label>
                <div className="product-detail-quantity-controls">
                  <button 
                    className="product-detail-quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="product-detail-quantity-input"
                    min="1"
                    max={product.product_quantity}
                  />
                  <button 
                    className="product-detail-quantity-btn"
                    onClick={() => setQuantity(Math.min(product.product_quantity, quantity + 1))}
                    disabled={quantity >= product.product_quantity}
                  >
                    +
                  </button>
                </div>
                <div className="product-detail-stock-info">
                  {product.product_quantity} sản phẩm có sẵn
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-detail-actions">
                <button 
                  className="product-detail-add-cart"
                  onClick={handleAddToCart}
                  disabled={product.product_quantity === 0}
                >
                  <ShoppingCart size={16} />
                  Thêm vào giỏ hàng
                </button>
                <button 
                  className="product-detail-buy-now"
                  disabled={product.product_quantity === 0}
                >
                  Mua ngay
                </button>
              </div>

              {/* Delivery Info */}
              <div className="product-detail-delivery">
                <div className="product-detail-delivery-item">
                  <Truck size={20} />
                  <div>
                    <strong>Miễn phí vận chuyển</strong>
                    <p>Cho đơn hàng từ 500.000đ</p>
                  </div>
                </div>
                <div className="product-detail-delivery-item">
                  <Shield size={20} />
                  <div>
                    <strong>Bảo hành</strong>
                    <p>7 ngày đổi trả miễn phí</p>
                  </div>
                </div>
                <div className="product-detail-delivery-item">
                  <Award size={20} />
                  <div>
                    <strong>Chính hãng</strong>
                    <p>Đảm bảo 100% chính hãng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="product-details">
            <div className="detail-tabs">
              <button 
                className={`tab ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Mô tả sản phẩm
              </button>
              <button 
                className={`tab ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                Thông số kỹ thuật
              </button>
              <button 
                className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Đánh giá ({reviews.length})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="description-content">
                  <p>{product.product_description || 'Chưa có mô tả sản phẩm.'}</p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="specs-content">
                  <table className="specs-table">
                    <tbody>
                      <tr>
                        <td className="spec-label">Danh mục</td>
                        <td className="spec-value">{product.product_category_id?.product_category_name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="spec-label">Số lượng còn lại</td>
                        <td className="spec-value">{product.product_quantity}</td>
                      </tr>
                      <tr>
                        <td className="spec-label">Trạng thái</td>
                        <td className="spec-value">
                          {product.product_status === 'available' ? 'Đang bán' : 'Ngừng bán'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-content">
                  {/* Reviews Summary */}
                  <div className="reviews-summary">
                    <div className="overall-rating">
                      <div className="rating-big">{(product.average_rating || 0).toFixed(1)}</div>
                      <div className="stars-big">
                        {renderStars(product.average_rating || 0, 'large')}
                      </div>
                      <div className="total-reviews">{reviews.length} đánh giá</div>
                    </div>
                  </div>

                  {/* Add Review Button */}
                  {user && (
                    <div style={{ marginBottom: '20px' }}>
                      <button 
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="product-detail-add-cart"
                      >
                        Viết đánh giá
                      </button>
                    </div>
                  )}

                  {/* Review Form */}
                  {showReviewForm && (
                    <div className="review-form" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                      <h4>Đánh giá sản phẩm</h4>
                      <div style={{ marginBottom: '15px' }}>
                        <label>Điểm đánh giá:</label>
                        <div style={{ display: 'flex', gap: '5px', margin: '5px 0' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={20}
                              className={star <= newReview.rating ? 'product-detail-star-filled' : 'product-detail-star-empty'}
                              fill={star <= newReview.rating ? 'currentColor' : 'none'}
                              onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{ marginBottom: '15px' }}>
                        <label>Bình luận:</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                          rows="4"
                          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <button
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                          className="product-detail-buy-now"
                          style={{ marginRight: '10px' }}
                        >
                          {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="product-detail-add-cart"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="reviews-list">
                    {reviews.length === 0 ? (
                      <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                    ) : (
                      reviews.map((review) => (
                        <div key={review._id} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <span className="reviewer-name">
                                {review.user_id?.username || 'Người dùng ẩn danh'}
                              </span>
                              <div className="review-rating">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="review-content">
                            <p>{review.comment}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products">
              <h2>Sản phẩm liên quan</h2>
              <div className="related-grid">
                {relatedProducts.map((relatedProduct) => (
                  <Link 
                    key={relatedProduct._id} 
                    to={`/product/${relatedProduct._id}`}
                    className="related-item"
                  >
                    <div className="related-image">
                      <img 
                        src={relatedProduct.product_imageurl?.[0] || '/default-product.png'} 
                        alt={relatedProduct.product_name}
                        onError={(e) => {
                          e.target.src = '/default-product.png';
                        }}
                      />
                    </div>
                    <div className="related-info">
                      <h4>{relatedProduct.product_name}</h4>
                      <div className="related-price">
                        {formatCurrency(relatedProduct.product_price)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Báo cáo sản phẩm</h3>
                <button onClick={() => setShowReportModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '15px' }}>
                  <label>Lý do báo cáo:</label>
                  <select
                    value={reportData.reason}
                    onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Chọn lý do</option>
                    <option value="spam">Spam</option>
                    <option value="inappropriate">Nội dung không phù hợp</option>
                    <option value="fake">Sản phẩm giả mạo</option>
                    <option value="copyright">Vi phạm bản quyền</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>Mô tả chi tiết:</label>
                  <textarea
                    value={reportData.description}
                    onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả chi tiết về vấn đề..."
                    rows="4"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={handleSubmitReport}
                  disabled={submittingReport || !reportData.reason}
                  className="product-detail-buy-now"
                  style={{ marginRight: '10px' }}
                >
                  {submittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="product-detail-add-cart"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default ProductDetail;