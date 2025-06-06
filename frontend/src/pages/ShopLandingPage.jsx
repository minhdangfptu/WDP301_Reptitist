import React, { useState } from 'react';
import { ShoppingCart, Search, User, HelpCircle, Facebook } from 'lucide-react';
import '../css/ShopLandingPage.css';
import Footer from '../components/Footer';

const ShopLandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Categories based on Image 2
  const categories = [
    { name: 'Chuồng nuôi', image: 'terrarium.png' },
    { name: 'Hệ thống sưởi', image: 'heating.png' },
    { name: 'Hệ thống chiếu sáng', image: 'lighting.png' },
    { name: 'Máy phun sương', image: 'mist.png' },
    { name: 'Hệ thống lọc khí', image: 'air-filter.png' },
    { name: 'Bát đựng nước, thức ăn', image: 'bowl.png' },
    { name: 'Trang trí chuồng', image: 'decor.png' },
    { name: 'Thức ăn', image: 'food.png' },
    { name: 'Vitamin & khoáng chất', image: 'vitamin.png' },
    { name: 'Dung dịch vệ sinh chuồng', image: 'cleaner.png' },
    { name: 'Thuốc khử', image: 'medicine.png' },
    { name: 'Gel dưỡng da & vảy', image: 'gel.png' }
  ];

  // Flash sale products based on Image 2
  const flashSaleProducts = [
    { id: 1, name: 'Bộ chuồng nuôi bò sát cao cấp', price: 100000, soldCount: 100, image: 'terrarium-setup.png' },
    { id: 2, name: 'Bộ chuồng nuôi bò sát cao cấp', price: 100000, soldCount: 100, image: 'terrarium-setup.png' },
    { id: 3, name: 'Bộ chuồng nuôi bò sát cao cấp', price: 100000, soldCount: 100, image: 'terrarium-setup.png' },
    { id: 4, name: 'Bộ chuồng nuôi bò sát cao cấp', price: 100000, soldCount: 100, image: 'terrarium-setup.png' }
  ];

  // New products based on Image 3
  const newProducts = [
    { id: 1, name: '[Kem Dưỡng] Kem dưỡng cá sấu 2025 vip pro', price: 200000, status: 'Bỏ vào giỏ', image: 'reptile-cream.png' },
    { id: 2, name: '[Kem Dưỡng] Kem dưỡng cá sấu 2025 vip pro', price: 200000, status: 'Bán chạy', image: 'reptile-cream.png' },
    { id: 3, name: '[Kem Dưỡng] Kem dưỡng cá sấu 2025 vip pro', price: 200000, status: 'Bình Sale 3/2', image: 'reptile-cream.png' },
    { id: 4, name: '[Kem Dưỡng] Kem dưỡng cá sấu 2025 vip pro', price: 200000, status: 'Freeship', image: 'reptile-cream.png' }
  ];

  // Featured products based on Image 3
  const featuredProducts = [
    { id: 1, name: 'Thức ăn khô', type: 'BỌ SÁT', price: '1kg/70.000đ', image: 'reptile-food.png' },
    { id: 2, name: 'Thức ăn khô', type: 'BỌ SÁT', price: '1kg/70.000đ', image: 'reptile-food.png' },
    { id: 3, name: 'Thức ăn khô', type: 'BỌ SÁT', price: '1kg/70.000đ', image: 'reptile-food.png' },
    { id: 4, name: 'Thức ăn khô', type: 'BỌ SÁT', price: '1kg/70.000đ', image: 'reptile-food.png' },
    { id: 5, name: 'Thức ăn khô', type: 'BỌ SÁT', price: '1kg/70.000đ', image: 'reptile-food.png' },
    { id: 6, name: 'Thức ăn khô', type: 'BỌ SÁT', price: '1kg/70.000đ', image: 'reptile-food.png' }
  ];

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
      <header className="header">
        <div className="top-header">
          <div className="top-links">
            <a href="#" className="top-link">Kênh người bán</a>
            <a href="#" className="top-link">Trở thành người bán trên Reptisist Shop</a>
            <a href="#" className="top-link">Kết nối với chúng tôi</a>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <Facebook size={16} />
              </a>
            </div>
          </div>
          <div className="top-actions">
            <a href="#" className="top-action">
              <HelpCircle size={16} /> Hỗ trợ
            </a>
            <a href="#" className="top-action">
              <User size={16} /> Tài khoản
            </a>
          </div>
        </div>
        
        <div className="main-header">
          <div className="logo-container">
            <img src="logo.png" alt="Reptisist Shop" className="logo" />
            <h1 className="shop-name">REPTISIST SHOP</h1>
          </div>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Tìm sản phẩm, thương hiệu, hoặc tên shop" 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-button">
              <Search size={18} />
            </button>
          </div>
          
          <div className="cart-container">
            <a href="#" className="cart-icon">
              <ShoppingCart size={22} />
            </a>
          </div>
        </div>
        
        <nav className="main-nav">
          <ul className="nav-links">
            <li><a href="#" className="nav-link">Chuồng & phụ kiện chuồng</a></li>
            <li><a href="#" className="nav-link">Thiết bị & dụng cụ nuôi</a></li>
            <li><a href="#" className="nav-link">Thức ăn & Dinh dưỡng</a></li>
            <li><a href="#" className="nav-link">Sản phẩm vệ sinh & chăm sóc sức khỏe</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-main">
            <img src="hero-banner.png" alt="Reptisist - Your Reptile Care Partners" className="hero-image" />
            <div className="hero-content">
              <h2>Your REPTILE CARE PARTNERS!</h2>
              <ul className="hero-features">
                <li>Premium alarms, heating lamps</li>
                <li>Live feed, and more!</li>
              </ul>
              <a href="#" className="shop-now-btn">SHOP NOW!</a>
            </div>
          </div>
          <div className="hero-side">
            <div className="hero-small">
              <img src="hero-small-1.png" alt="Reptile Care" className="hero-small-image" />
            </div>
            <div className="hero-small">
              <img src="hero-small-2.png" alt="Reptile Care" className="hero-small-image" />
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
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div className="category-item" key={index}>
              <div className="category-image-container">
                <img src={category.image} alt={category.name} className="category-image" />
              </div>
              <div className="category-name">{category.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="flash-sale-section">
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
        <div className="products-grid">
          {flashSaleProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
              </div>
              <div className="product-info">
                <div className="product-price">{product.price.toLocaleString()} đ</div>
                <div className="product-sold-indicator">
                  <div className="sold-progress">
                    <div className="sold-progress-bar" style={{ width: '100%' }}></div>
                  </div>
                  <div className="sold-text">Đã bán {product.soldCount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products-section">
        <div className="section-header">
          <h2>TÌM KIẾM HÀNG ĐẦU</h2>
        </div>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div className="featured-product-card" key={product.id}>
              <div className="featured-product-image-container">
                <img src={product.image} alt={product.name} className="featured-product-image" />
              </div>
              <div className="featured-product-info">
                <div className="featured-product-type">{product.type}</div>
                <div className="featured-product-name">{product.name}</div>
                <div className="featured-product-price">{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Products */}
      <section className="new-products-section">
        <div className="section-header">
          <h2>MỚI NHẤT HÔM NAY</h2>
        </div>
        <div className="products-grid">
          {newProducts.map(product => (
            <div className="new-product-card" key={product.id}>
              <div className="new-product-image-container">
                <img src={product.image} alt={product.name} className="new-product-image" />
                <div className="product-badge">{product.status}</div>
              </div>
              <div className="new-product-info">
                <div className="new-product-name">{product.name}</div>
                <div className="new-product-price">{product.price.toLocaleString()} đ</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Login Banner */}
      <section className="login-banner">
        <div className="login-message">Đăng nhập để biết thêm thông tin</div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ShopLandingPage;