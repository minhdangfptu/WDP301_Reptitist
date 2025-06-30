"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Search, ShoppingCart, Bell, HelpCircle, User, Package } from "lucide-react"
import "../css/CustomHeader.css"

// Thêm prop pageTitle để có thể tùy chỉnh tên trang
const CustomHeader = ({ pageTitle = "Giỏ Hàng", pageIcon = ShoppingCart }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const location = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    // Implement search functionality here
  }

  // Tạo biến PageIcon để có thể sử dụng động
  const PageIcon = pageIcon

  return (
    <>
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
              <div className="logo">
                <img src="/logo2.png" alt="Reptitist Logo" className="logo-image" />
              </div>
            </Link>
            <div className="page-title">
              <PageIcon size={20} className="page-icon" />
              {pageTitle}
            </div>
          </div>

          <div className="search-container">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="main-nav">
        <div className="container">
          <ul className="nav-list">
            <li className={location.pathname === "/" || location.pathname === "/cart" ? "active" : ""}>
              <Link to="/my-cart">
                <ShoppingCart size={16} />
                Giỏ Hàng
              </Link>
            </li>
            <li className={location.pathname === "/orders" ? "active" : ""}>
              <Link to="/orders">
                <Package size={16} />
                Đơn Hàng
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}

export default CustomHeader
