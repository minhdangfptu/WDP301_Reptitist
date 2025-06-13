/* eslint-disable no-console */
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
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ reason: '', description: '' });
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/reptitist/shop/products/detail/${productId}`
        );
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load product details");
        setLoading(false);
        console.error("Error fetching product:", err);
      }
    };

    fetchProduct();
  }, [productId]);
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/reptitist/shop/products-feedbacks/${productId}`
        );

        setReviews(response.data.feedbacks || []);
        setReviewsCount(response.data.count || 0);
        setLoading(false);
      } catch (err) {
        setError("Failed to load product details");
        setLoading(false);
        console.error("Error fetching product:", err);
      }
    };

    fetchFeedbacks();
  }, [productId]);
  useEffect(() => {
    // Fetch related products based on the product's category
    const fetchRelatedProducts = async () => {
      if (product && product.product_category_id) {
        try {
          const response = await axios.get(
            `http://localhost:8080/reptitist/shop/products/category/${product.product_category_id}`
          );
          setRelatedProducts(response.data);
        } catch (err) {
          setError("Failed to load related products");
          console.error("Error fetching related products:", err);
        }
      }
    };
    fetchRelatedProducts();
  }, [product]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.product_quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    console.log("Add to cart:", {
      product: product.id,
      quantity,
      variant: selectedVariant,
    });
  };

  const handleBuyNow = () => {
    console.log("Buy now:", {
      product: product.id,
      quantity,
      variant: selectedVariant,
    });
  };
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        <img
          src="/loading.gif"
          alt="Loading"
          style={{ width: "50px", height: "50px" }}
        />
        Đang tải...
      </div>
    );
  }

  if (error) return <div>{error}</div>;
  return (
    <div className="pd-page">
      {/* Header - Using shop- classes to match CSS */}
      <header className="shop-header">
        <div className="shop-top-header">
          <div className="shop-top-links">
            <a
              href="/"
              className="shop-top-link"
              style={{ fontWeight: "bold" }}
            >
              TRANG CHỦ
            </a>
            <a href="#" className="shop-top-link">
              Trở thành người bán trên Reptisist Shop
            </a>
            <a href="#" className="shop-top-link">
              Kết nối với chúng tôi
            </a>
            <div className="shop-social-icons">
              <a href="#" className="shop-social-icon">
                <Facebook size={16} />
              </a>
            </div>
          </div>
          <div className="shop-top-actions">
            <a href="#" className="shop-top-action">
              <HelpCircle size={16} /> Hỗ trợ
            </a>
            <a href="#" className="shop-top-action">
              <User size={16} /> Tài khoản
            </a>
          </div>
        </div>

        <div className="shop-main-header">
          <div className="shop-logo-container">
            <a href="/">
              <img
                src="/logo_knen.png"
                alt="Reptisist Shop"
                className="shop-logo"
              />
            </a>
            <h1 className="shop-name">REPTISIST SHOP</h1>
          </div>

          <div className="shop-search-container">
            <input
              type="text"
              placeholder="Tìm sản phẩm, thương hiệu, hoặc tên shop"
              className="shop-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="shop-search-button">
              <Search size={18} />
            </button>
          </div>

          <div className="shop-cart-container">
            <a href="#" className="shop-cart-icon">
              <ShoppingCart size={22} />
            </a>
          </div>
        </div>

        <nav className="shop-main-nav">
          <ul className="shop-nav-links">
            <li>
              <a href="#" className="shop-nav-link">
                Chuồng & phụ kiện chuồng
              </a>
            </li>
            <li>
              <a href="#" className="shop-nav-link">
                Thiết bị & dụng cụ nuôi
              </a>
            </li>
            <li>
              <a href="#" className="shop-nav-link">
                Thức ăn & Dinh dưỡng
              </a>
            </li>
            <li>
              <a href="#" className="shop-nav-link">
                Sản phẩm vệ sinh & chăm sóc sức khỏe
              </a>
            </li>
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
                src={
                  product?.product_imageurl?.[selectedImage] ||
                  "/default-image.png"
                }
                alt={product?.name || "Product"}
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
            <div className="product-detail-thumbnails">
              {product?.product_imageurl?.length > 0 ? (
                product.product_imageurl.map((image, index) => (
                  <div
                    key={index}
                    className={`product-detail-thumbnail ${
                      selectedImage === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))
              ) : (
                <div>No images available</div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <h1 className="product-detail-title">{product?.product_name}</h1>

            <div className="product-detail-rating">
              <div className="product-detail-rating-stars">
                <span className="product-detail-rating-number">
                  {product?.average_rating}
                </span>
                <div className="product-detail-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product?.average_rating)
                          ? "product-detail-star-filled"
                          : "product-detail-star-empty"
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="product-detail-rating-stats">
                <span className="product-detail-review-count">
                  ({reviewsCount} đánh giá)
                </span>
                {/* <span className="product-detail-sold-count">
                  {product.sold} đã bán
                </span> */}
              </div>
            </div>

            <div className="product-detail-price">
              <div className="product-detail-current-price">
                ₫{product.product_price?.toLocaleString() || "0"}
              </div>
              <div className="product-detail-original-price">
                ₫{product.originalPrice?.toLocaleString() || "0"}
              </div>
              <div className="product-detail-discount">
                -{product.discount || 0}%
              </div>
            </div>

            <div className="product-detail-variants">
              {product.variants &&
                product.variants.map((variant, index) => (
                  <div key={index} className="product-detail-variant-group">
                    <label className="product-detail-variant-label">
                      {variant.name}
                    </label>
                    <div className="product-detail-variant-options">
                      {variant.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          className={`product-detail-variant-option ${
                            selectedVariant === option ? "selected" : ""
                          }`}
                          onClick={() => setSelectedVariant(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <div className="product-detail-quantity">
              <label className="product-detail-quantity-label">Số lượng</label>
              <div className="product-detail-quantity-controls">
                <button
                  className="product-detail-quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="product-detail-quantity-input"
                  min="1"
                  max={product?.product_quantity}
                />
                <button
                  className="product-detail-quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product?.product_quantity}
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="product-detail-stock-info">
                {product?.product_quantity} sản phẩm có sẵn
              </span>
            </div>

            {/* Action Buttons */}
            <div className="product-detail-actions">
              <button className="product-detail-add-cart" disabled={product.product_quantity === 0} onClick={handleAddToCart}>
                <ShoppingCart size={20} />
                Thêm vào giỏ hàng
              </button>
              <button className="product-detail-buy-now"  disabled={product.product_quantity === 0} onClick={handleBuyNow}>
                Mua ngay
              </button>
            </div>

            {/* Delivery Info */}
            <div className="product-detail-delivery">
              <div className="product-detail-delivery-item">
                <Truck size={20} />
                <div>
                  <strong>Miễn phí vận chuyển</strong>
                  <p>Đơn hàng từ 500k</p>
                </div>
              </div>
              <div className="product-detail-delivery-item">
                <Shield size={20} />
                <div>
                  <strong>Đảm bảo chất lượng</strong>
                  <p>Hoàn tiền 100% nếu lỗi</p>
                </div>
              </div>
              <div className="product-detail-delivery-item">
                <RotateCcw size={20} />
                <div>
                  <strong>Đổi trả trong 7 ngày</strong>
                  <p>Miễn phí đổi trả</p>
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
              className={`tab ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả sản phẩm
            </button>
            <button
              className={`tab ${
                activeTab === "specifications" ? "active" : ""
              }`}
              onClick={() => setActiveTab("specifications")}
            >
              Thông số kỹ thuật
            </button>
            <button
              className={`tab ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá ({reviewsCount})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br>') || 'Chưa có mô tả sản phẩm' }}  />
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="specifications-content">
                <table className="specs-table">
                  <tbody>
                    {product?.product_description
                      .split("\n")
                      .map((line, index) => (
                        <tr key={index}>
                          <td className="spec-label">
                            {index === 0 ? "Mô tả sản phẩm" : ""}
                          </td>
                          <td className="spec-value">
                            {line.split(" ").map((word, wordIndex) => (
                              <span key={wordIndex}>{word} </span>
                            ))}
                          </td>
                        </tr>
                      ))}
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
                      
                    </div>

                    <div className="total-reviews">{reviewsCount} đánh giá</div>
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
    </div>
  );
};

export default ProductDetail;
