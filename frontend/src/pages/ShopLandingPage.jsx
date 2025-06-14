/* eslint-disable no-console */
import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  User,
  HelpCircle,
  Facebook,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../css/ShopLandingPage.css";
import Footer from "../components/Footer";
import ProductCategories from "./ProductCategories";
import { Container } from "react-bootstrap";
import axios from "axios";
import UnderDevPage from "./UnderDevPage";

const ShopLandingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const productsPerSlide = 6;
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/reptitist/shop/category"
        );
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh mục sản phẩm");
        setLoading(false);
        console.error("Lỗi khi tải danh mục:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/reptitist/shop/products/recent/"
        );
        setNewProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load new products");
        setLoading(false);
        console.error("Error fetching new products:", err);
      }
    };

    fetchNewProducts();
  }, []);
  useEffect(() => {
    const fetchTopRatedProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/reptitist/shop/products/top-rated"
        );
        setTopRatedProducts(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm đánh giá cao:", err);
        setLoading(false);
      }
    };

    fetchTopRatedProducts();
  }, []);

  // Categories based on Image 2
  // const flashSaleProducts = [
  //   {
  //     id: 1,
  //     name: "Bộ chuồng nuôi bò sát cao cấp",
  //     price: 100000,
  //     soldCount: 100,
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 2,
  //     name: "Bộ chuồng nuôi bò sát cao cấp",
  //     price: 100000,
  //     soldCount: 100,
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 3,
  //     name: "Bộ chuồng nuôi bò sát cao cấp",
  //     price: 100000,
  //     soldCount: 100,
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 4,
  //     name: "Bộ chuồng nuôi bò sát cao cấp",
  //     price: 100000,
  //     soldCount: 100,
  //     image: "/product1.png",
  //   },
  // ];

  // New products based on Image 3
  // const newProducts = [
  //   {
  //     id: 1,
  //     name: "[Kem Dưỡng] Kem dưỡng cá sấu 2025 vip pro",
  //     price: 200000,
  //     status: "Bỏ vào giỏ",
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 2,
  //     name: "[Kem Dưỡng] Kem dưỡng cá sấu 2025 vip pro",
  //     price: 200000,
  //     status: "Bán chạy",
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 3,
  //     name: "[Kem Dưỡng] Kem dưỡng cá sấu 2025 vip pro",
  //     price: 200000,
  //     status: "Bình Sale 3/2",
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 4,
  //     name: "[Kem Dưỡng] Kem dưỡng cá sấu 2025 vip pro",
  //     price: 200000,
  //     status: "Freeship",
  //     image: "/product1.png",
  //   },
  // ];
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        <img src="/loading.gif" alt="Loading" style={{ width: '50px', height: '50px' }} />
        Đang tải...
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }
  // Featured products based on Image 3
  // const featuredProducts = [
  //   {
  //     id: 1,
  //     name: "Thức ăn khô",
  //     type: "BỌ SÁT",
  //     price: "1kg/70.000đ",
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 2,
  //     name: "Thức ăn khô",
  //     type: "BỌ SÁT",
  //     price: "1kg/70.000đ",
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 3,
  //     name: "Thức ăn khô",
  //     type: "BỌ SÁT",
  //     price: "1kg/70.000đ",
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 4,
  //     name: "Thức ăn khô",
  //     type: "BỌ SÁT",
  //     price: "1kg/70.000đ",
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 5,
  //     name: "Thức ăn khô",
  //     type: "BỌ SÁT",
  //     price: "1kg/70.000đ",
  //     image: "/product1.png",
  //   },
  //   {
  //     id: 6,
  //     name: "Thức ăn khô",
  //     type: "BỌ SÁT",
  //     price: "1kg/70.000đ",
  //     image: "/product1.png",
  //   },
  // ];

  // Shop features based on Image 1
  const shopFeatures = [
    { name: "Hàng Chọn Giá Hời", icon: "🏷️" },
    { name: "Mã Giảm Giá", icon: "🎫" },
    { name: "Miễn Phí Ship - Có Reptitist", icon: "🚚" },
    { name: "Reptitist Style Voucher 30%", icon: "🛍️" },
    { name: "Voucher Giảm Đến 1 Triệu", icon: "📝" },
    { name: "Khung Giờ Săn Sale", icon: "⚡" },
    { name: "Quốc Tế Deal Đồng Giá", icon: "🌐" },
    { name: "Nạp Thẻ, Dịch Vụ & Hóa Đơn", icon: "📱" },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev + productsPerSlide >= topRatedProducts.length
        ? 0
        : prev + productsPerSlide
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev - productsPerSlide < 0
        ? Math.max(0, topRatedProducts.length - productsPerSlide)
        : prev - productsPerSlide
    );
  };

  return (
    <div className="shop-landing-page">
      {/* Header */}
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
            <Link to="/my-cart" className="shop-cart-icon">
              <ShoppingCart size={22} />
            </Link>
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

      {/* Hero Banner */}
      {/* <section className="hero-section">
        <div className="hero-container">
          <div className="hero-main">
            <img src="logo1_conen-01-01.png" alt="Reptisist - Your Reptile Care Partners" className="hero-image" />
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
      </section> */}

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
      <Container fluid shop-container mt-4 mb-4 px-3 px-sm-0>
        {/* Categories */}
        <section className="categories-section">
          <div className="section-header">
            <h2 style={{ fontWeight: "700" }}>DANH MỤC</h2>
          </div>
          {loading ? (
            <div className="text-center">Đang tải danh mục...</div>
          ) : error ? (
            <div className="text-center text-danger">{error}</div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <div className="category-item" key={category._id}>
                  <div className="category-image-container">
                    <img
                      src={category.product_category_imageurl}
                      alt={category.product_category_name}
                      className="category-image"
                    />
                  </div>
                  <div className="category-name">
                    {category.product_category_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Flash Sale */}
        <section className="flash-sale-section">
          <div className="section-header">
            <h2 style={{ fontWeight: "700" }}>FLASH SALE</h2>
            <div className="countdown">
              <span className="countdown-number">01</span>
              <span className="countdown-separator">:</span>
              <span className="countdown-number">00</span>
              <span className="countdown-separator">:</span>
              <span className="countdown-number">00</span>
            </div>
          </div>
          <div>
            <h2
              style={{
                fontWeight: "700",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              Coming Soon
            </h2>
          </div>
          <div className="products-grid">
            {/* {flashSaleProducts.map((product) => (
              <Link
                to="/product-detail"
                key={product.id}
                className="product-link"
              >
                <div className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-price">
                      {product.price.toLocaleString()} đ
                    </div>
                    <div className="product-sold-indicator">
                      <div className="sold-progress">
                        <div
                          className="sold-progress-bar"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <div className="sold-text">
                        Đã bán {product.soldCount}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))} */}
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-products-section">
          <div className="section-header">
            <h2 style={{ fontWeight: "700" }}>SẢN PHẨM HÀNG ĐẦU</h2>
            <div className="carousel-controls">
              <button className="carousel-control-btn" onClick={prevSlide}>
                <ChevronLeft size={24} />
              </button>
              <button className="carousel-control-btn" onClick={nextSlide}>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          <div className="products-grid">
            {topRatedProducts
              .slice(currentSlide, currentSlide + productsPerSlide)
              .map((product) => (
                <Link
                  to={`/product-detail/${product._id}`}
                  key={product._id}
                  className="product-link"
                >
                  <div className="featured-product-card">
                    <div className="featured-product-image-container">
                      <img
                        src={product.product_imageurl[0] || "/product1.png"}
                        alt={product.product_name}
                        className="featured-product-image"
                      />
                      <div className="rating-badge">
                        ⭐ {product.average_rating?.toFixed(1) || "0.0"}
                      </div>
                    </div>
                    <div className="featured-product-info">
                      <div className="featured-product-type">
                        {product.product_category_id?.product_category_name ||
                          "Không phân loại"}
                      </div>
                      <div className="featured-product-name">
                        {product.product_name}
                      </div>
                      <div className="featured-product-price">
                        {product.product_price?.toLocaleString()} đ
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* New Products */}
        <section className="new-products-section">
          <div className="section-header">
            <h2 style={{ fontWeight: "700" }}>MỚI NHẤT HÔM NAY</h2>
          </div>
          <div className="products-grid">
            {newProducts.map((product) => (
              <Link
                to={`/product-detail/${product._id}`}
                key={product._id}
                className="product-link"
              >
                <div className="new-product-card">
                  <div className="new-product-image-container">
                    <img
                      src={product.product_imageurl[0] || "/product1.png"}
                      alt={product.product_name}
                      className="new-product-image"
                    />
                    <div className="product-badge">
                      {product.product_status}
                    </div>
                  </div>
                  <div className="new-product-info">
                    <div className="new-product-name">
                      {product.product_name}
                    </div>
                    <div className="new-product-price">
                      {product.product_price?.toLocaleString()} đ
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Login Banner */}
        {/* <section className="login-banner">
          <div className="login-message">Đăng nhập để biết thêm thông tin</div>
        </section> */}
      </Container>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ShopLandingPage;
