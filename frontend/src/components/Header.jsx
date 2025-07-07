import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Header.css";
import "../css/common.css";

const Header = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const accountRef = useRef(null);
  const { user, logout, hasRole, hasAnyRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
              <Link
                to="/"
                className={`header__nav-link${location.pathname === "/" ? " header__nav-link--active" : ""}`}
              >
                TRANG CHỦ
              </Link>
            </li>
            <li>
              <Link
                to="/Community"
                className={`header__nav-link${location.pathname === "/Community" ? " header__nav-link--active" : ""}`}
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
                className={`header__nav-link${location.pathname === "/LibraryTopic" ? " header__nav-link--active" : ""}`}
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
                className={`header__nav-link${location.pathname === "/ShopLandingPage" ? " header__nav-link--active" : ""}`}
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
            {user && (
              <li>
                <Link to="/YourPet" className={`header__nav-link${location.pathname === "/YourPet" ? " header__nav-link--active" : ""}`}>
                  THÚ CƯNG
                </Link>
              </li>
            )}
            <li>
              <Link to="/AboutUs" className={`header__nav-link${location.pathname === "/AboutUs" ? " header__nav-link--active" : ""}`}>
                VỀ CHÚNG TÔI
              </Link>
            </li>
            
          </ul>

          <div
            className="header__account-menu"
            ref={accountRef}
            onClick={() => setShowAccountMenu(!showAccountMenu)}
          >
            <div className="header__account-menu-text">
              <span>{user ? user?.fullname || user?.username : "Tài khoản"}</span>
              <span
                className={`header__caret ${showAccountMenu ? "header__caret--up" : ""}`}
              >
                ▼
              </span>
            </div>

            {showAccountMenu && (
              <div className="header__dropdown">
                {user ? (
                  <>
                    {/* Personal Menu Section */}
                    <div className="header__dropdown-divider" style={{opacity: 0, padding: 0, paddingTop: "10px", margin: 0}}></div>
                        <div style={{color: "#11ae5f"}} className="header__dropdown-section-title ">
                          Quản lý tài khoản
                        </div>
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

                    {/* Shop Management Section cho account_type >= 3 */}
                    {user?.account_type.type >= 3 && (
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
                            Tổng quan thông tin cửa hàng
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
                            Quản lý cừa hàng
                          </Link>
                          <Link
                            to="/AdminTransactionManagement"
                            className="header__dropdown-item header__dropdown-item--admin"
                            onClick={() => setShowAccountMenu(false)}
                          >
                            Quản lý giao dịch
                          </Link>
                          <Link
                            to="/ProductManagement"
                            className="header__dropdown-item header__dropdown-item--admin"
                            onClick={() => setShowAccountMenu(false)}
                          >
                            Quản lý sản phẩm
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
                  </>
                ) : (
                  <div className="header__dropdown-section">
                    <Link
                      to="/Login"
                      className="header__dropdown-item"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/SignUp"
                      className="header__dropdown-item"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
