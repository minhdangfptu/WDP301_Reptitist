"use client";

/* eslint-disable no-console */
import { useState, useEffect } from "react";
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
  Search,
  User,
  HelpCircle,
  Facebook,
} from "lucide-react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import "../css/ProductDetail.css";
import "../css/editForm.css";
import Footer from "../components/Footer";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import {
  updateFeedbackAndRating,
  deleteFeedbackAndRating,
} from "../services/feedbackService";
import ShopHeader from "../components/ShopHeader";
import { baseUrl } from '../config';
import AddToCartModal from "../components/AddToCartModal"
import BuyNowModal from "../components/BuyNowModal"
import { addToCartService } from "../services/cartService"
import { useCart } from "../context/CartContext"

const ProductDetail = () => {
  const { productId } = useParams()
  const { user } = useAuth()
  const userId = user ? user.id : null
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewsCount, setReviewsCount] = useState(0)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState("")
  const [activeTab, setActiveTab] = useState("description")
  const [searchTerm, setSearchTerm] = useState("")
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState("")
  // const [newImages, setNewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState("")
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false)
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false)
  const { cartCount } = useCart()
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log(productId);
        const response = await axios.get(
          `${baseUrl}/reptitist/shop/products/detail/${productId}`
        );
        setProduct(response.data);
        console.log(
          "product>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
          response.data
        );
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
          `${baseUrl}/reptitist/shop/products-feedbacks/${productId}`
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

  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/reptitist/shop/products/category/${categoryId}`
      );
      const related = response.data
        .filter((p) => p._id !== productId)
        .slice(0, 6);
      setRelatedProducts(related);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/reptitist/shop/products-feedbacks/${productId}`
      );
      setReviews(response.data.feedbacks || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.product_quantity) {
      setQuantity(newQuantity);
    }
  }

  const handleBuyNow = () => {
    setIsBuyNowModalOpen(true);
  };

  const handleBuyNowSubmit = async (productId, quantity) => {
    try {
      await addToCartService(productId, quantity)
      toast.success("Đã thêm vào giỏ hàng và chuyển đến trang thanh toán!")
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("Vui lòng điền đầy đủ thông tin sản phẩm")
      } else if (error.response?.status === 500) {
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau")
      } else if (error.response?.status === 401) {
        toast.error("Bạn cần đăng nhập để mua sản phẩm")
      }
    }
    setIsBuyNowModalOpen(false)
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
  };

  const handleRemoveImage = (index) => {
    setNewImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleUpdateFeedback = async (feedbackId) => {
    if (submitting) return;
    if (editRating === 0) {
      alert("Vui lòng chọn số sao đánh giá");
      return;
    }
    if (!editComment.trim()) {
      alert("Vui lòng nhập bình luận đánh giá");
      return;
    }
    setSubmitting(true);
    try {
      await updateFeedbackAndRating(feedbackId, editRating, editComment);
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === feedbackId
            ? { ...review, rating: editRating, comment: editComment }
            : review
        )
      );
      toast.success("Cập nhật đánh giá thành công!");
      setEditingReview(null);
      setEditRating(0);
      setEditComment("");
    } catch (error) {
      console.error("Error updating feedback:", error.message);
      if (error.response?.status === 400) {
        alert("Vui lòng điền đầy đủ thông tin đánh giá");
      } else if (error.response?.status === 500) {
        alert("Đã có lỗi xảy ra, vui lòng thử lại sau");
      } else if (error.response?.status === 401) {
        alert("Bạn cần đăng nhập để cập nhật đánh giá");
      } else if (error.response?.status === 404) {
        alert("Đánh giá không tồn tại hoặc đã bị xóa");
      }
      setError("Failed to update feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (reviewId) => {
    try {
      await deleteFeedbackAndRating(reviewId);
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== reviewId)
      );
      setReviewsCount((prevCount) => prevCount - 1);
      toast.success("Xóa đánh giá thành công!");
    } catch (error) {
      console.error("Error deleting feedback:", error.message);
      if (error.response?.status === 400) {
        alert("Đã có lỗi xảy ra, vui lòng thử lại sau");
      } else if (error.response?.status === 401) {
        alert("Bạn cần đăng nhập để xóa đánh giá");
      } else if (error.response?.status === 404) {
        alert("Đánh giá không tồn tại hoặc đã bị xóa");
      }
      setError("Failed to delete feedback");
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null)
    setEditRating(0)
    setEditComment("")
  }

  const handleAddToCart = async (productId, quantity) => {
    console.log("Adding to cart:", { productId, quantity })

    try {
      await addToCartService(productId, quantity)
      toast.success("Thêm vào giỏ hàng thành công!")
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("Vui lòng điền đầy đủ thông tin sản phẩm")
      } else if (error.response?.status === 500) {
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau")
      } else if (error.response?.status === 401) {
        toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng")
      }
    }
    setIsAddToCartModalOpen(false)

  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error("Vui lòng nhập bình luận");
      return;
    }

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${baseUrl}/reptitist/shop/products-feedbacks/${productId}`,
        {
          rating: newReview.rating,
          comment: newReview.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Đánh giá thành công");
        setNewReview({ rating: 5, comment: "" });
        setShowReviewForm(false);
        fetchReviews();
        fetchProductDetail();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đánh giá"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchProductDetail = async () => {
    try {
      setLoading(true);

      // Fetch product details
      const productResponse = await axios.get(
        `${baseUrl}/reptitist/shop/products/detail/${productId}`
      );
      const productData = productResponse.data;

      if (productData) {
        setProduct(productData);

        // Fetch related products
        if (productData.product_category_id) {
          fetchRelatedProducts(
            productData.product_category_id._id ||
              productData.product_category_id
          );
        }

        // Fetch reviews
        fetchReviews();
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Không thể tải thông tin sản phẩm");
      Navigate("/shop");
    } finally {
      setLoading(false);
    }
  };
  // Thêm hàm renderStars
  const renderStars = (rating, size = "medium") => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            size={size === "large" ? 24 : 16}
            className="product-detail-star-filled"
            fill="currentColor"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            size={size === "large" ? 24 : 16}
            className="product-detail-star-filled"
            fill="url(#half)"
          />
        );
      } else {
        stars.push(
          <Star
            key={i}
            size={size === "large" ? 24 : 16}
            className="product-detail-star-empty"
          />
        );
      }
    }

    return stars;
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
      <ShopHeader />

      {/* Breadcrumb */}
      <div className="product-detail-breadcrumb">
        <nav className="product-detail-nav">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <a href="/ShopLandingPage">Shop</a>
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
                alt={product?.product_name || "Product"}
              />

              <div className="product-detail-image-actions">
                <button
                  className="product-detail-action-btn"
                  onClick={() => setShowReportModal(true)}
                  title="Báo cáo sản phẩm"
                >
                  🚩
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
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.product_name} ${index + 1}`}
                    />
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
                  {renderStars(product?.average_rating || 0)}
                </div>
              </div>
              <div className="product-detail-rating-stats">
                <span className="product-detail-review-count">
                  ({reviewsCount} đánh giá)
                </span>
              </div>
            </div>

            <div className="product-detail-price">
              <div className="product-detail-current-price">
                ₫{product?.product_price?.toLocaleString() || "0"}
              </div>
              <div className="product-detail-original-price">
                ₫{product?.originalPrice?.toLocaleString() || "0"}
              </div>
              <div className="product-detail-discount">
                -{product?.discount || 0}%
              </div>
            </div>

            <div className="product-detail-variants">
              {product?.variants &&
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
                    setQuantity(
                      Math.max(1, Number.parseInt(e.target.value) || 1)
                    )
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
              <button className="product-detail-add-cart" onClick={() => setIsAddToCartModalOpen(true)}>
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
                    __html: product?.product_description?.replace(
                      /\n/g,
                      "<br>"
                    ),
                  }}
                />
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="specifications-content">
                <table className="specs-table">
                  <tbody>
                    {product?.product_description
                      ?.split("\n")
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
                {/* Reviews Summary */}
                <div className="reviews-summary">
                  <div className="overall-rating">
                    <div className="rating-big">
                      {(product.average_rating || 0).toFixed(1)}
                    </div>
                    <div className="stars-big">
                      {renderStars(product.average_rating || 0, "large")}
                    </div>
                    <div className="total-reviews">
                      {reviews.length} đánh giá
                    </div>
                  </div>
                </div>

                {/* Add Review Button */}
                {user && (
                  <div style={{ marginBottom: "20px" }}>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="product-detail-add-cart"
                    >
                      Viết đánh giá
                    </button>
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <div
                    className="review-form"
                    style={{
                      marginBottom: "20px",
                      padding: "20px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >
                    <h4>Đánh giá sản phẩm</h4>
                    <div style={{ marginBottom: "15px" }}>
                      <label>Điểm đánh giá:</label>
                      <div
                        style={{ display: "flex", gap: "5px", margin: "5px 0" }}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={
                              star <= newReview.rating
                                ? "product-detail-star-filled"
                                : "product-detail-star-empty"
                            }
                            fill={
                              star <= newReview.rating ? "currentColor" : "none"
                            }
                            onClick={() =>
                              setNewReview((prev) => ({
                                ...prev,
                                rating: star,
                              }))
                            }
                            style={{ cursor: "pointer" }}
                          />
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                      <label>Bình luận:</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview((prev) => ({
                            ...prev,
                            comment: e.target.value,
                          }))
                        }
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                        rows="4"
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="product-detail-buy-now"
                        style={{ marginRight: "10px" }}
                      >
                        {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="product-detail-add-cart"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                  {reviews.length === 0 ? (
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">
                              {review.user_id?.username || "Người dùng ẩn danh"}
                            </span>
                            <div className="review-rating">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        <div className="review-content">
                          <p>{review.comment}</p>
                        </div>
                      </div>
                    ))
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
                    <a href={`/product-detail/${item._id}`}>
                      <img
                        src={item.product_imageurl[0] || "/placeholder.svg"}
                        alt={item.product_name}
                      />
                    </a>
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
      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={isAddToCartModalOpen}
        onClose={() => setIsAddToCartModalOpen(false)}
        product={product}
        onAddToCart={handleAddToCart}
      />
      
      {/* Buy Now Modal */}
      <BuyNowModal
        isOpen={isBuyNowModalOpen}
        onClose={() => setIsBuyNowModalOpen(false)}
        product={product}
        onBuyNow={handleBuyNowSubmit}
      />
    </div>
  );
}


export default ProductDetail;
