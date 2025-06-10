import React, { useState } from 'react';
import { Star, Heart, Share2, ShoppingCart, Plus, Minus, Truck, Shield, RotateCcw, MessageCircle, Search, User, HelpCircle, Facebook } from 'lucide-react';
import '../css/ProductDetail.css';

const ProductDetail = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data cho sản phẩm
  const product = {
    id: 1,
    name: 'Bộ chuồng nuôi bò sát cao cấp - Terrarium Professional 60x40x40cm',
    price: 2500000,
    originalPrice: 3000000,
    discount: 17,
    rating: 4.8,
    reviewCount: 156,
    sold: 1200,
    stock: 48,
    images: [
      '/product1.png',
      '/product1.png',
      '/product1.png',
      '/product1.png',
      '/product1.png'
    ],
    variants: [
      { name: 'Kích thước', options: ['60x40x40cm', '80x50x50cm', '100x60x60cm'] },
      { name: 'Màu sắc', options: ['Đen', 'Nâu', 'Xám'] }
    ],
    description: `
      Bộ chuồng nuôi bò sát cao cấp được thiết kế đặc biệt cho việc nuôi dưỡng các loài bò sát. 
      Sản phẩm được làm từ kính cường lực cao cấp, đảm bảo độ bền và an toàn tuyệt đối.
      
      Đặc điểm nổi bật:
      • Kính cường lực dày 5mm, chịu lực tốt
      • Hệ thống thông gió tự nhiên
      • Khóa an toàn chống thoát
      • Dễ dàng vệ sinh và bảo trì
      • Thiết kế hiện đại, phù hợp mọi không gian
    `,
    specifications: {
      'Chất liệu': 'Kính cường lực + Khung nhôm',
      'Kích thước': '60 x 40 x 40 cm',
      'Trọng lượng': '8.5 kg',
      'Xuất xứ': 'Việt Nam',
      'Bảo hành': '12 tháng'
    },
    seller: {
      name: 'Reptisist Official Store',
      rating: 4.9,
      responseRate: 98,
      joinDate: '2020'
    }
  };

  const reviews = [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      rating: 5,
      date: '2024-03-15',
      comment: 'Sản phẩm rất tốt, chất lượng như mô tả. Đóng gói cẩn thận.',
      images: ['/product1.png', '/product1.png']
    },
    {
      id: 2,
      user: 'Trần Thị B',
      rating: 4,
      date: '2024-03-10',
      comment: 'Chuồng đẹp, chất lượng ổn. Giao hàng nhanh.',
      images: []
    }
  ];

  const relatedProducts = [
    { id: 2, name: 'Đèn sưởi bò sát UVB 26W', price: 450000, image: '/product1.png' },
    { id: 3, name: 'Thức ăn khô cho rồng râu', price: 180000, image: '/product1.png' },
    { id: 4, name: 'Máy phun sương tự động', price: 680000, image: '/product1.png' },
    { id: 5, name: 'Bát đựng nước gốm cao cấp', price: 120000, image: '/product1.png' },
    { id: 6, name: 'Đèn sưởi bò sát UVB 26W', price: 450000, image: '/product1.png' },
    { id: 7, name: 'Thức ăn khô cho rồng râu', price: 180000, image: '/product1.png' },
    { id: 8, name: 'Máy phun sương tự động', price: 680000, image: '/product1.png' },
    { id: 9, name: 'Bát đựng nước gốm cao cấp', price: 120000, image: '/product1.png' }
  ];

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    console.log('Add to cart:', { product: product.id, quantity, variant: selectedVariant });
  };

  const handleBuyNow = () => {
    console.log('Buy now:', { product: product.id, quantity, variant: selectedVariant });
  };

  return (
    <div className="pd-page">
      {/* Header - Using shop- classes to match CSS */}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="pd-search-button">
              <Search size={18} />
            </button>
          </div>
          
          <div className="pd-cart-container">
            <a href="#" className="pd-cart-icon">
              <ShoppingCart size={22} />
            </a>
          </div>
        </div>
        
        <nav className="pd-main-nav">
          <ul className="pd-nav-links">
            <li><a href="#" className="pd-nav-link">Chuồng & phụ kiện chuồng</a></li>
            <li><a href="#" className="pd-nav-link">Thiết bị & dụng cụ nuôi</a></li>
            <li><a href="#" className="pd-nav-link">Thức ăn & Dinh dưỡng</a></li>
            <li><a href="#" className="pd-nav-link">Sản phẩm vệ sinh & chăm sóc sức khỏe</a></li>
          </ul>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className="product-detail-breadcrumb">
        <nav className="product-detail-nav">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <a href="/shop">Shop</a>
          <span>/</span>
          <a href="/category">Chuồng nuôi</a>
          <span>/</span>
          <span>{product.name}</span>
        </nav>
      </div>

      {/* Product Main */}
      <div className="pd-container">
        <div className="product-detail-main">
          {/* Product Images */}
          <div className="product-detail-images">
            <div className="product-detail-main-image">
              <img src={product.images[selectedImage]} alt={product.name} />
              <div className="product-detail-image-actions">
                <button className="product-detail-action-btn">
                  <Heart size={20} />
                </button>
                <button className="product-detail-action-btn">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            <div className="product-detail-thumbnails">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`product-detail-thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <h1 className="product-detail-title">{product.name}</h1>
            
            <div className="product-detail-rating">
              <div className="product-detail-rating-stars">
                <span className="product-detail-rating-number">{product.rating}</span>
                <div className="product-detail-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating) ? 'product-detail-star-filled' : 'product-detail-star-empty'}
                    />
                  ))}
                </div>
              </div>
              <div className="product-detail-rating-stats">
                <span className="product-detail-review-count">({product.reviewCount} đánh giá)</span>
                <span className="product-detail-sold-count">{product.sold} đã bán</span>
              </div>
            </div>

            <div className="product-detail-price">
              <div className="product-detail-current-price">
                ₫{product.price.toLocaleString()}
              </div>
              <div className="product-detail-original-price">
                ₫{product.originalPrice.toLocaleString()}
              </div>
              <div className="product-detail-discount">
                -{product.discount}%
              </div>
            </div>

            {/* Variants */}
            <div className="product-detail-variants">
              {product.variants.map((variant, index) => (
                <div key={index} className="product-detail-variant-group">
                  <label className="product-detail-variant-label">{variant.name}</label>
                  <div className="product-detail-variant-options">
                    {variant.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        className={`product-detail-variant-option ${selectedVariant === option ? 'selected' : ''}`}
                        onClick={() => setSelectedVariant(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity */}
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
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="product-detail-quantity-input"
                  min="1"
                  max={product.stock}
                />
                <button
                  className="product-detail-quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="product-detail-stock-info">{product.stock} sản phẩm có sẵn</span>
            </div>

            {/* Action Buttons */}
            <div className="product-detail-actions">
              <button className="product-detail-add-cart" onClick={handleAddToCart}>
                <ShoppingCart size={20} />
                Thêm vào giỏ hàng
              </button>
              <button className="product-detail-buy-now" onClick={handleBuyNow}>
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
              className={`tab ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Thông số kỹ thuật
            </button>
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Đánh giá ({product.reviewCount})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br>') }} />
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="specifications-content">
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="spec-label">{key}</td>
                        <td className="spec-value">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="overall-rating">
                    <div className="rating-big">{product.rating}</div>
                    <div className="stars-big">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}
                        />
                      ))}
                    </div>
                    <div className="total-reviews">{product.reviewCount} đánh giá</div>
                  </div>
                </div>

                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.user}</span>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? 'star-filled' : 'star-empty'}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <div className="review-content">
                        <p>{review.comment}</p>
                        {review.images.length > 0 && (
                          <div className="review-images">
                            {review.images.map((image, index) => (
                              <img key={index} src={image} alt={`Review ${index + 1}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="related-products">
          <h2>Sản phẩm liên quan</h2>
          <div className="related-grid">
            {relatedProducts.map((item) => (
              <div key={item.id} className="related-item">
                <div className="related-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="related-info">
                  <h4>{item.name}</h4>
                  <div className="related-price">₫{item.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;