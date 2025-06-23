import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, HelpCircle, Search, ShoppingCart, User } from 'lucide-react';
import '../css/ShopLayout.css';

const ShopLayout = ({ children }) => {
  return (
    <div className="shop-layout">
      {/* Top navigation bar */}
      <div className="top-nav">
        <div className="container top-nav-container">
          <div className="top-nav-left">
            <a href="#" className="top-nav-link">
              Kênh Bán Hàng
            </a>
            <span className="divider">|</span>
            <a href="#" className="top-nav-link">
              Tải Ứng Dụng
            </a>
            <span className="divider">|</span>
            <a href="#" className="top-nav-link">
              Kết Nối
            </a>
          </div>
          <div className="top-nav-right">
            <a href="#" className="top-nav-link">
              <Bell size={16} className="icon" />
              Thông Báo
            </a>
            <a href="#" className="top-nav-link">
              <HelpCircle size={16} className="icon" />
              Trợ Giúp
            </a>
            <a href="#" className="top-nav-link">
              <User size={16} className="icon" />
              Đăng Nhập
            </a>
            <span className="divider">|</span>
            <a href="#" className="top-nav-link">
              Đăng Ký
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="main-header">
        <div className="container main-header-container">
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <div className="logo">E</div>
              <div className="brand-name">EcoShop</div>
            </Link>
          </div>

          <div className="search-container">
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="search-input"
              />
              <button type="submit" className="search-button">
                <Search size={20} />
              </button>
            </form>
          </div>

          <div className="cart-container">
            <Link to="/my-cart" className="cart-icon">
              <ShoppingCart size={24} />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="main-nav">
        <div className="container">
          <ul className="nav-list">
            <li>
              <Link to="/shop">
                Chuồng & phụ kiện chuồng
              </Link>
            </li>
            <li>
              <Link to="/shop">
                Thiết bị & dụng cụ nuôi
              </Link>
            </li>
            <li>
              <Link to="/shop">
                Thức ăn & Dinh dưỡng
              </Link>
            </li>
            <li>
              <Link to="/shop">
                Sản phẩm vệ sinh & chăm sóc sức khỏe
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <main className="shop-main-content">
        {children}
      </main>
    </div>
  );
};

export default ShopLayout; 