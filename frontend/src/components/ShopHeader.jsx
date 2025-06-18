import React, { useState } from "react";
import {
  ShoppingCart,
  Search,
  User,
  HelpCircle,
  Facebook,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
function ShopHeader() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const {cartCount} = useCart();
  const {user} = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        console.log(searchTerm);
      navigate(`/products/search/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div>
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
            <a href="/ShopLandingPage">
              <img
                src="/logo_knen.png"
                alt="Reptisist Shop"
                className="shop-logo"
              />
            </a>
            <a href="/ShopLandingPage">
              <h1 className="shop-name">REPTISIST SHOP</h1>
            </a>
          </div>

          <div className="shop-search-container">
            <input
              type="text"
              placeholder="Tìm sản phẩm, thương hiệu, hoặc tên shop"
              className="shop-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch} className="shop-search-button">
              <Search size={18} />
            </button>
          </div>

          <div className="shop-cart-container">
            <a href="/my-cart" className="shop-cart-icon" style={{ position: "relative" }}>
              <ShoppingCart size={22} />
              {user && cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  {cartCount}
                </span>
              )}
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
    </div>
    
  );
  
}

export default ShopHeader;
