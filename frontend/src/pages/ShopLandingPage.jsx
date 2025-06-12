import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, HelpCircle, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../css/ShopLandingPage.css';
import Footer from '../components/Footer';

const ShopLandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchRecentProducts(),
        fetchFeaturedProducts()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/reptitist/shop/category');
      const categoriesData = response.data || [];
      
      // Take first 12 categories for display
      setCategories(categoriesData.slice(0, 12));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Fetch recent products for "flash sale" and "new products"
  const fetchRecentProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/reptitist/shop/products/recent/');
      const products = response.data || [];
      
      // Split products for different sections
      setFlashSaleProducts(products.slice(0, 4));
      setNewProducts(products.slice(4, 8));
    } catch (error) {
      console.error('Error fetching recent products:', error);
      setFlashSaleProducts([]);
      setNewProducts([]);
    }
  };

  // Fetch featured products from a specific category
  const fetchFeaturedProducts = async () => {
    try {
      // Try to get products from first category if available
      if (categories.length > 0) {
        const response = await axios.get(`http://localhost:8080/reptitist/shop/products/category/${categories[0]._id}`);
        const products = response.data || [];
        setFeaturedProducts(products.slice(0, 6));
      } else {
        // Fallback to recent products
        const response = await axios.get('http://localhost:8080/reptitist/shop/products/recent/');
        const products = response.data || [];
        setFeaturedProducts(products.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results or filter products
      console.log('Searching for:', searchTerm);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/product1.png';
    if (Array.isArray(imageUrl)) {
      return imageUrl[0] || '/product1.png';
    }
    return imageUrl;
  };

  // Shop features based on Image 1
  const shopFeatures = [
    { name: 'Hàng Chọn Giá Hời', icon: '🏷️' },
    { name: 'Mã Giảm Giá', icon: '🎫' },
    { name: 'Miễn Phí Ship - Có Shopee', icon: '🚚' },
    { name: 'Shopee Style Voucher 30%', icon: '🛍️' },
    { name: 'Voucher Giảm Đến 1 Triệu', icon: '📝' },
    { name: 'Khung Giờ Săn Sale', icon: '⚡' },
    { name: 'Quốc Tế Deal Đồng Giá', icon: '🌐' },
    { name: 'Nạp Thẻ, Dịch Vụ & Hóa Đơn', icon: '📱' }
  ];

  return (
    <div className="shop-landing-page">
      {/* Header */}
      <header className="shop-header">
        <div className="shop-top-header">
          <div className="shop-top-links">
            <a href="#" className="shop-top-link">Kênh người bán</a>
            <Link to="/shop/products" className="shop-top-link">Trở thành người bán trên Reptisist Shop</Link>
            <a href="#" className="shop-top-link">Kết nối với chúng tôi</a>
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
            <Link to="/login" className="shop-top-action">
              <User size={16} /> Tài khoản
            </Link>
          </div>
        </div>
        
        <div className="shop-main-header">
          <div className="shop-logo-container">
            <img src="/logo1.png" alt="Reptisist Shop" className="shop-logo" />
            <h1 className="shop-name">REPTISIST SHOP</h1>
          </div>
          
          <form onSubmit={handleSearch} className="shop-search-container">
            <input 
              type="text" 
              placeholder="Tìm sản phẩm, thương hiệu, hoặc tên shop" 
              className="shop-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="shop-search-button">
              <Search size={18} />
            </button>
          </form>
          
          <div className="shop-cart-container">
            <Link to="/cart" className="shop-cart-icon">
              <ShoppingCart size={22} />
            </Link>
          </div>
        </div>
        
        <nav className="shop-main-nav">
          <ul className="shop-nav-links">
            <li><a href="#" className="shop-nav-link">Chuồng & phụ kiện chuồng</a></li>
            <li><a href="#" className="shop-nav-link">Thiết bị & dụng cụ nuôi</a></li>
            <li><a href="#" className="shop-nav-link">Thức ăn & Dinh dưỡng</a></li>
            <li><a href="#" className="shop-nav-link">Sản phẩm vệ sinh & chăm sóc sức khỏe</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-main">
            <img src="product1.png" alt="Reptisist - Your Reptile Care Partners" className="hero-image" />
            <div className="hero-content">
              <h2>Your REPTILE CARE PARTNERS!</h2>
              <ul className="hero-features">
                <li>Premium alarms, heating lamps</li>
                <li>Live feed, and more!</li>
              </ul>
              <a href="#products" className="shop-now-btn">SHOP NOW!</a>
            </div>
          </div>
          <div className="hero-side">
            <div className="hero-small">
              <img src="product1.png" alt="Reptile Care" className="hero-small-image" />
            </div>
            <div className="hero-small">
              <img src="product1.png" alt="Reptile Care" className="hero-small-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Shop Features */}
      <section className="shop-features">
        <div className="features-container">
          {shopFeatures.map((feature, index) => (
            <div className="feature-item" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-name">{feature.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-header">
          <h2>DANH MỤC</h2>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div>Đang tải danh mục...</div>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div className="category-item" key={category._id || index}>
                <div className="category-image-container">
                  <img 
                    src={getImageUrl(category.product_category_imageurl)} 
                    alt={category.product_category_name} 
                    className="category-image"
                    onError={(e) => {
                      e.target.src = '/product1.png';
                    }}
                  />
                </div>
                <div className="category-name">{category.product_category_name}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Flash Sale */}
      <section className="flash-sale-section" id="products">
        <div className="section-header">
          <h2>FLASH SALE</h2>
          <div className="countdown">
            <span className="countdown-number">01</span>
            <span className="countdown-separator">:</span>
            <span className="countdown-number">00</span>
            <span className="countdown-separator">:</span>
            <span className="countdown-number">00</span>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div>Đang tải sản phẩm...</div>
          </div>
        ) : flashSaleProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div>Chưa có sản phẩm flash sale</div>
          </div>
        ) : (
          <div className="products-grid">
            {flashSaleProducts.map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="product-link">
                <div className="product-card">
                  <div className="product-image-container">
                    <img 
                      src={getImageUrl(product.product_imageurl)} 
                      alt={product.product_name} 
                      className="product-image"
                      onError={(e) => {
                        e.target.src = '/product1.png';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-price">{formatCurrency(product.product_price)}</div>
                    <div className="product-sold-indicator">
                      <div className="sold-progress">
                        <div className="sold-progress-bar" style={{ width: '100%' }}></div>
                      </div>
                      <div className="sold-text">Đã bán 0</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="featured-products-section">
        <div className="section-header">
          <h2>TÌM KIẾM HÀNG ĐẦU</h2>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div>Đang tải sản phẩm...</div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div>Chưa có sản phẩm nổi bật</div>
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="product-link">
                <div className="featured-product-card">
                  <div className="featured-product-image-container">
                    <img 
                      src={getImageUrl(product.product_imageurl)} 
                      alt={product.product_name} 
                      className="featured-product-image"
                      onError={(e) => {
                        e.target.src = '/product1.png';
                      }}
                    />
                  </div>
                  <div className="featured-product-info">
                    <div className="featured-product-type">BỌ SÁT</div>
                    <div className="featured-product-name">{product.product_name}</div>
                    <div className="featured-product-price">{formatCurrency(product.product_price)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* New Products */}
      <section className="new-products-section">
        <div className="section-header">
          <h2>MỚI NHẤT HÔM NAY</h2>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div>Đang tải sản phẩm...</div>
          </div>
        ) : newProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div>Chưa có sản phẩm mới</div>
          </div>
        ) : (
          <div className="products-grid">
            {newProducts.map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="product-link">
                <div className="new-product-card">
                  <div className="new-product-image-container">
                    <img 
                      src={getImageUrl(product.product_imageurl)} 
                      alt={product.product_name} 
                      className="new-product-image"
                      onError={(e) => {
                        e.target.src = '/product1.png';
                      }}
                    />
                    <div className="product-badge">MỚI</div>
                  </div>
                  <div className="new-product-info">
                    <div className="new-product-name">{product.product_name}</div>
                    <div className="new-product-price">{formatCurrency(product.product_price)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Login Banner */}
      <section className="login-banner">
        <div className="login-message">
          <Link to="/login">Đăng nhập để biết thêm thông tin</Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ShopLandingPage;