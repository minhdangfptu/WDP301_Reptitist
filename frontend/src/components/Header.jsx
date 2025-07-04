import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Header.css";
import "../css/common.css";

const Header = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const accountRef = useRef(null);
  const { user, logout, hasRole, hasAnyRole, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setShowAccountMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  // Check if user is a shop (either role is shop or account_type is shop)
  const isShop = () => {
    return hasRole("shop") || user?.account_type?.type === "shop";
  };

  if (loading || loggingOut) {
    return (
      <header
        className="header"
        style={{
          width: "100%",
          zIndex: 1000,
          background: "#fff",
          minHeight: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/loading.gif"
          alt="Đang tải..."
          style={{ width: 48, height: 48 }}
        />
        <span style={{ marginLeft: 16, fontWeight: 500, fontSize: 18 }}>
          {loggingOut ? "Đang đăng xuất..." : "Chào mừng bạn đến với Reptitist Service"}
        </span>
      </header>
    );
  }

  return (
    <header
      style={{ position: "static", width: "100%", zIndex: "1000" }}
      className="header"
    >
      <div className="container">
        <nav className="header__nav">
          <Link to="/">
            <img
              style={{
                width: "135px",
                height: "auto",
                justifyContent: "center",
                marginBottom: "0px",
                marginTop: "0px",
              }}
              src="/logo1.png"
              className="header__logo"
              alt="Logo"
            />
          </Link>
          <ul className="header__nav-links">
            <li>
              <Link to="/" className="header__nav-link">
                TRANG CHỦ
              </Link>
            </li>
            <li>
              <Link
                to="/Community"
                className="header__nav-link"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate("/Login");
                  }
                }}
              >
                CỘNG ĐỒNG
              </Link>
            </li>
            <li>
              <Link
                to="/LibraryTopic"
                className="header__nav-link"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate("/Login");
                  }
                }}
              >
                THƯ VIỆN
              </Link>
            </li>
            <li>
              <Link
                to="/ShopLandingPage"
                className="header__nav-link"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate("/Login");
                  }
                }}
              >
                MUA SẮM
              </Link>
            </li>
            <li>
              <Link to="/ContactUs" className="header__nav-link">
                LIÊN HỆ
              </Link>
            </li>
            <li>
              <Link to="/AboutUs" className="header__nav-link">
                VỀ CHÚNG TÔI
              </Link>
            </li>
            {user && (
              <li>
                <Link to="/YourPet" className="header__nav-link">
                  BÒ SÁT CỦA BẠN
                </Link>
              </li>
            )}
          </ul>

          <div
            className="header__account-menu"
            ref={accountRef}
            onClick={() => setShowAccountMenu(!showAccountMenu)}
          >
            <div className="header__account-menu-text">
              <span>{user ? user.fullname || user.username : "Tài khoản"}</span>
              <span
                className={`header__caret ${showAccountMenu ? "header__caret--up" : ""
                  }`}
              >
                ▼
              </span>
            </div>

            {showAccountMenu && (
              <div className="header__dropdown">
                {/* Header Section */}
                <div className="header__dropdown-header">
                  <div>Xin chào, {user.fullname || user.username}!</div>
                  {isShop() && (
                    <span className="header__shop-badge">
                      {user.account_type?.level === "premium" ? "Shop Premium" : "Shop"}
                    </span>
                  )}
                </div>

                {/* Personal Menu Section */}
                <div className="header__dropdown-section">
                  <Link
                    to="/Profile"
                    className="header__dropdown-item"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/Security"
                    className="header__dropdown-item"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Bảo mật tài khoản
                  </Link>
                  <Link
                    to="/Settings"
                    className="header__dropdown-item"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Cài đặt
                  </Link>
                  <Link
                    to="/Transaction"
                    className="header__dropdown-item"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Lịch sử giao dịch
                  </Link>
                </div>

                {/* Shop Management Section */}
                {isShop() && (
                  <>
                    <div className="header__dropdown-divider"></div>
                    <div className="header__dropdown-section-title header__dropdown-section-title--shop">
                      Quản lý cửa hàng
                    </div>
                    <div className="header__dropdown-section">
                      <Link
                        to="/ShopDashboard"
                        className="header__dropdown-item header__dropdown-item--shop"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        Dashboard Shop
                      </Link>
                      <Link
                        to="/ProductManagement"
                        className="header__dropdown-item header__dropdown-item--shop"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        Quản lý sản phẩm
                      </Link>
                      <Link
                        to="/OrderManagement"
                        className="header__dropdown-item header__dropdown-item--shop"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        Quản lý đơn hàng
                      </Link>
                    </div>
                  </>
                )}

                {/* Admin Management Section */}
                {hasRole("admin") && (
                  <>
                    <div className="header__dropdown-divider"></div>
                    <div className="header__dropdown-section-title header__dropdown-section-title--admin">
                      Quản trị hệ thống
                    </div>
                    <div className="header__dropdown-section">
                      <Link
                        to="/UserManagement"
                        className="header__dropdown-item header__dropdown-item--admin"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        Quản lý người dùng
                      </Link>
                      <Link
                        to="/AdminShopManagement"
                        className="header__dropdown-item header__dropdown-item--admin"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        Quản lý Shop
                      </Link>
                      <Link
                        to="/AdminTransactionManagement"
                        className="header__dropdown-item header__dropdown-item--admin"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        Quản lý giao dịch
                      </Link>
                    </div>
                  </>
                )}

                {/* Logout Section */}
                <div
                  className="header__dropdown-logout"
                  onClick={() => {
                    handleLogout();
                    setShowAccountMenu(false);
                  }}
                >
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
