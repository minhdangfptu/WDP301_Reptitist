import React, { useState } from "react";
import {
  ShoppingCart,
  Search,
  User,
  HelpCircle,
  Facebook,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
function ShopHeader() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user } = useAuth();

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
            {user?.account_type?.type >= 3 ? (
              <a
                href="/ShopDashboard"
                className="shop-top-link"
                style={{ fontWeight: "bold"}}
              >
                QUẢN LÝ CỬA HÀNG CỦA BẠN
              </a>
            ) : (
              <>
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
              </>
              
            )}
            
           
          </div>
          <div className="shop-top-actions">
            <a href="#" className="shop-top-action">
              <HelpCircle size={16} /> Hỗ trợ
            </a>
            {user ? (
              <span
                className="shop-top-action"
                style={{ fontWeight: "bold", color: "white" }}
              >
                <User size={16} style={{ marginRight: 4 }} />
                <a href="/Profile" >{user.fullname || user.username || user.email}</a>
              </span>
            ) : (
              <a href="/Login" className="shop-top-action">
                <User size={16} /> Tài khoản
              </a>
            )}
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

          <div
            className="shop-cart-container"
            style={{ display: "flex", alignItems: "center" }}
          >
            <a
              href="/my-cart"
              className="shop-cart-icon"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                color: "white",
                textDecoration: "none",
                fontWeight: 400,
                fontSize: 15,
              }}
            >
              <ShoppingCart size={22} />
              {user && cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "60px",
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
              <span style={{ marginLeft: 8 }}>Giỏ hàng</span>
            </a>
          </div>
          <div className="shop-orders-container" style={{ marginLeft: 16 }}>
            <a
              href="/my-orders"
              className="shop-orders-link"
              style={{
                display: "flex",
                alignItems: "center",
                color: "white",
                fontWeight: "400",
                textDecoration: "none",
                fontSize: 15,
              }}
            >
              <Package size={22} style={{ marginRight: 6 }} />
              Đơn hàng
            </a>
          </div>
        </div>

        <nav className="shop-main-nav">
          <ul className="shop-nav-links">
            <li>
              <a href="#" className="shop-nav-link">
                Reptitist Shop - Nơi cung cấp thiết bị, dụng cụ nuôi, thức ăn,
                dinh dưỡng, sản phẩm vệ sinh & chăm sóc sức khỏe cho động vật
                nhà
              </a>
            </li>
            <li>
              <a href="#" className="shop-nav-link">
                Liên hệ cộng tác
              </a>
            </li>
            <li>
              <a href="#" className="shop-nav-link">
                Đăng ký trở thành người bán
              </a>
            </li>
            <li>
              <a href="#" className="shop-nav-link">
                Kết nối với đội ngũ Reptitist chuyên nghiệp
              </a>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}

export default ShopHeader;
