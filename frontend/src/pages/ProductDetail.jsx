/* eslint-disable no-console */
import React, { useState } from "react";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Search,
  User,
  HelpCircle,
  Facebook,
} from "lucide-react";
import "../css/ProductDetail.css";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/reptitist/shop/products/detail/${productId}`
        );
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load product details");
        setLoading(false);
        console.error("Error fetching product:", err);
      }
    };

    fetchProduct();
  }, [productId]);
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/reptitist/shop/products-feedbacks/${productId}`
        );

        setReviews(response.data.feedbacks || []);
        setReviewsCount(response.data.count || 0);
        setLoading(false);
      } catch (err) {
        setError("Failed to load product details");
        setLoading(false);
        console.error("Error fetching product:", err);
      }
    };

    fetchFeedbacks();
  }, [productId]);
  useEffect(() => {
    // Fetch related products based on the product's category
    const fetchRelatedProducts = async () => {
      if (product && product.product_category_id) {
        try {
          const response = await axios.get(
            `http://localhost:8080/reptitist/shop/products/category/${product.product_category_id}`
          );
          setRelatedProducts(response.data);
        } catch (err) {
          setError("Failed to load related products");
          console.error("Error fetching related products:", err);
        }
      }
    };
    fetchRelatedProducts();
  }, [product]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.product_quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    console.log("Add to cart:", {
      product: product.id,
      quantity,
      variant: selectedVariant,
    });
  };

  const handleBuyNow = () => {
    console.log("Buy now:", {
      product: product.id,
      quantity,
      variant: selectedVariant,
    });
  };
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        <img
          src="/loading.gif"
          alt="Loading"
          style={{ width: "50px", height: "50px" }}
        />
        Đang tải...
      </div>
    );
  }

  if (error) return <div>{error}</div>;
  return (
    <div className="pd-page">
      {/* Header - Using shop- classes to match CSS */}
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
            <a href="#" className="shop-cart-icon">
              <ShoppingCart size={22} />
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

      {/* Breadcrumb */}
      <div className="product-detail-breadcrumb">
        <nav className="product-detail-nav">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <a href="/shop">Shop</a>
          <span>/</span>
          <span>{product?.product_name}</span>
        </nav>
      </div>

      {/* Product Main */}
      <div className="pd-container">
        <div className="product-detail-main">
          {/* Product Images */}
          <div className="product-detail-images">
            <div className="product-detail-main-image">
              <img
                src={
                  product?.product_imageurl?.[selectedImage] ||
                  "/default-image.png"
                }
                alt={product?.name || "Product"}
              />

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
              {product?.product_imageurl?.length > 0 ? (
                product.product_imageurl.map((image, index) => (
                  <div
                    key={index}
                    className={`product-detail-thumbnail ${
                      selectedImage === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))
              ) : (
                <div>No images available</div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <h1 className="product-detail-title">{product?.product_name}</h1>

            <div className="product-detail-rating">
              <div className="product-detail-rating-stars">
                <span className="product-detail-rating-number">
                  {product?.average_rating}
                </span>
                <div className="product-detail-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product?.average_rating)
                          ? "product-detail-star-filled"
                          : "product-detail-star-empty"
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="product-detail-rating-stats">
                <span className="product-detail-review-count">
                  ({reviewsCount} đánh giá)
                </span>
                {/* <span className="product-detail-sold-count">
                  {product.sold} đã bán
                </span> */}
              </div>
            </div>

            <div className="product-detail-price">
              <div className="product-detail-current-price">
                ₫{product.product_price?.toLocaleString() || "0"}
              </div>
              <div className="product-detail-original-price">
                ₫{product.originalPrice?.toLocaleString() || "0"}
              </div>
              <div className="product-detail-discount">
                -{product.discount || 0}%
              </div>
            </div>

            <div className="product-detail-variants">
              {product.variants &&
                product.variants.map((variant, index) => (
                  <div key={index} className="product-detail-variant-group">
                    <label className="product-detail-variant-label">
                      {variant.name}
                    </label>
                    <div className="product-detail-variant-options">
                      {variant.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          className={`product-detail-variant-option ${
                            selectedVariant === option ? "selected" : ""
                          }`}
                          onClick={() => setSelectedVariant(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

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
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="product-detail-quantity-input"
                  min="1"
                  max={product?.product_quantity}
                />
                <button
                  className="product-detail-quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product?.product_quantity}
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="product-detail-stock-info">
                {product?.product_quantity} sản phẩm có sẵn
              </span>
            </div>

            <div className="product-detail-actions">
              <button
                className="product-detail-add-cart"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={20} />
                Thêm vào giỏ
              </button>
              <button className="product-detail-buy-now" onClick={handleBuyNow}>
                Mua ngay
              </button>
            </div>

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
              className={`tab ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả sản phẩm
            </button>
            <button
              className={`tab ${
                activeTab === "specifications" ? "active" : ""
              }`}
              onClick={() => setActiveTab("specifications")}
            >
              Thông số kỹ thuật
            </button>
            <button
              className={`tab ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá ({reviewsCount})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "description" && (
              <div className="description-content">
                <div
                  dangerouslySetInnerHTML={{
                    __html: product?.product_description.replace(/\n/g, "<br>"),
                  }}
                />
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="specifications-content">
                <table className="specs-table">
                  <tbody>
                    {product?.product_description
                      .split("\n")
                      .map((line, index) => (
                        <tr key={index}>
                          <td className="spec-label">
                            {index === 0 ? "Mô tả sản phẩm" : ""}
                          </td>
                          <td className="spec-value">
                            {line.split(" ").map((word, wordIndex) => (
                              <span key={wordIndex}>{word} </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="overall-rating">
                    <div className="rating-big">
                      😍 {product?.average_rating} ⭐😍
                    </div>

                    <div className="total-reviews">{reviewsCount} đánh giá</div>
                  </div>
                </div>

                <div className="reviews-list">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review._id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            {/* Handle missing user information */}
                            <span className="reviewer-name">
                              {review.user_id
                                ? review.user_id.username
                                : "Anonymous"}
                            </span>
                            <div className="review-rating">
                              {/* Render the rating stars */}
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? "star-filled"
                                      : "star-empty"
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="review-content">
                          <p>{review.comment}</p>
                          {/* If the review has images, display them */}
                          {review.images && review.images.length > 0 && (
                            <div className="review-images">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Review ${index + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No reviews available</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="related-products">
          <h2>Sản phẩm liên quan</h2>
          <div className="related-grid">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((item) => (
                <div key={item._id} className="related-item">
                  <div className="related-image">
                    <img
                      src={item.product_imageurl[0]}
                      alt={item.product_name}
                    />
                  </div>
                  <div className="related-info">
                    <h4>{item.product_name}</h4>
                    <div className="related-price">
                      ₫{item.product_price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No related products found</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
