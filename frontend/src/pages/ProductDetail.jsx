"use client"

/* eslint-disable no-console */
import { useState } from "react"
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
} from "lucide-react"
import { FiEdit } from "react-icons/fi"
import { RiDeleteBinLine } from "react-icons/ri"
import "../css/ProductDetail.css"
import "../css/editForm.css"
import Footer from "../components/Footer"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"
import { updateFeedbackAndRating,deleteFeedbackAndRating } from "../services/feedbackService"

const ProductDetail = () => {
  const { productId } = useParams()
  const { user } = useAuth()
  const userId = user ? user.id : null
  const [newImages, setNewImages] = useState([])
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
  const [editingReview, setEditingReview] = useState(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState("")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/reptitist/shop/products/detail/${productId}`)
        setProduct(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load product details")
        setLoading(false)
        console.error("Error fetching product:", err)
      }
    }

    fetchProduct()
  }, [productId])
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/reptitist/shop/products-feedbacks/${productId}`)

        setReviews(response.data.feedbacks || [])
        setReviewsCount(response.data.count || 0)
        setLoading(false)
      } catch (err) {
        setError("Failed to load product details")
        setLoading(false)
        console.error("Error fetching product:", err)
      }
    }

    fetchFeedbacks()
  }, [productId])
  useEffect(() => {
    // Fetch related products based on the product's category
    const fetchRelatedProducts = async () => {
      if (product && product.product_category_id) {
        try {
          const response = await axios.get(
            `http://localhost:8080/reptitist/shop/products/category/${product.product_category_id}`,
          )
          setRelatedProducts(response.data)
        } catch (err) {
          setError("Failed to load related products")
          console.error("Error fetching related products:", err)
        }
      }
    }
    fetchRelatedProducts()
  }, [product])

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.product_quantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    console.log("Add to cart:", {
      product: product.id,
      quantity,
      variant: selectedVariant,
    })
  }

  const handleBuyNow = () => {
    console.log("Buy now:", {
      product: product.id,
      quantity,
      variant: selectedVariant,
    })
  }
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
  }
  const handleRemoveImage = (index) => {
    setNewImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }
  // const handleSubmitFeedback = async (e) => {
  //   e.preventDefault()
  //   if (submitting) return // Prevent multiple submissions
  //   if (newRating == 0) {
  //     alert("Vui lòng chọn chọn số sao đánh giá")
  //     return
  //   }
  //   if (!newComment.trim()) {
  //     alert("Vui lòng nhập bình luận đánh giá")
  //     return
  //   }
  //   setSubmitting(true)
  //   try {
  //     const response = await createFeedbackAndRatingApi(productId, newRating, newComment)
  //     setReviews((prevReviews) => [
  //       ...prevReviews,
  //       {
  //         rating: newRating,
  //         comment: newComment,
  //         // images: newImages,
  //         user_id: { username: "Bạn" }, // Mock user data
  //         createdAt: new Date().toISOString(),
  //       },
  //     ])
  //     setReviewsCount((prevCount) => prevCount + 1)
  //     setNewRating(0)
  //     setNewComment("")
  //     setNewImages([])
  //     setSubmitting(false)
  //   } catch (error) {
  //     console.error("Error submitting feedback:", error)
  //     if (error.response?.status === 400) {
  //       alert("Vui lòng điền đầy đủ thông tin đánh giá")
  //     } else if (error.response?.status === 500) {
  //       alert("Đã có lỗi xảy ra, vui lòng thử lại sau")
  //     } else if (error.response?.status === 401) {
  //       alert("Bạn cần đăng nhập để đánh giá sản phẩm")
  //     } else if (error.response?.status === 404) {
  //       alert("Sản phẩm không tồn tại hoặc đã bị xóa")
  //     }
  //     setError("Failed to submit feedback")
  //   } finally {
  //     setSubmitting(false)
  //   }
  // }

  const handleUpdateFeedback = async (feedbackId) => {
    if (submitting) return // Prevent multiple submissions
    if (editRating === 0) {
      alert("Vui lòng chọn số sao đánh giá")
      return
    }
    if (!editComment.trim()) {
      alert("Vui lòng nhập bình luận đánh giá")
      return
    }
    setSubmitting(true)
    try {
      await updateFeedbackAndRating(feedbackId, editRating, editComment);
      // Update the reviews list with the edited review
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === feedbackId ? { ...review, rating: editRating, comment: editComment } : review,
        ),
      )

      toast.success("Cập nhật đánh giá thành công!")
      setEditingReview(null)
      setEditRating(0)
      setEditComment("")
    } catch (error) {
      console.error("Error updating feedback:", error.message)
      if (error.response?.status === 400) {
        alert("Vui lòng điền đầy đủ thông tin đánh giá")
      } else if (error.response?.status === 500) {
        alert("Đã có lỗi xảy ra, vui lòng thử lại sau")
      } else if (error.response?.status === 401) {
        alert("Bạn cần đăng nhập để cập nhật đánh giá")
      } else if (error.response?.status === 404) {
        alert("Đánh giá không tồn tại hoặc đã bị xóa")
      }
      setError("Failed to update feedback")
    } finally {
      setSubmitting(false);
    }
  }
  const handleDeleteFeedback = async (reviewId) => {
    try {
      await deleteFeedbackAndRating(reviewId)
      setReviews((prevReviews) => prevReviews.filter((review) => review._id !== reviewId))
      setReviewsCount((prevCount) => prevCount - 1)
      toast.success("Xóa đánh giá thành công!")
    } catch (error) {
      console.error("Error deleting feedback:", error.message)
      if (error.response?.status === 400) {
        alert("Đã có lỗi xảy ra, vui lòng thử lại sau");
      } else if (error.response?.status === 401) {
        alert("Bạn cần đăng nhập để xóa đánh giá");
      } else if (error.response?.status === 404) {
        alert("Đánh giá không tồn tại hoặc đã bị xóa");
      }
      setError("Failed to delete feedback");
    }
  }


  const handleCancelEdit = () => {
    setEditingReview(null)
    setEditRating(0)
    setEditComment("")
  }

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
        <img src="/loading.gif" alt="Loading" style={{ width: "50px", height: "50px" }} />
        Đang tải...
      </div>
    )
  }

  if (error) return <div>{error}</div>
  return (
    <div className="pd-page">
      {/* Header - Using shop- classes to match CSS */}
      <header className="shop-header">
        <div className="shop-top-header">
          <div className="shop-top-links">
            <a href="/" className="shop-top-link" style={{ fontWeight: "bold" }}>
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
              <img src="/logo_knen.png" alt="Reptisist Shop" className="shop-logo" />
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
                src={product.product_imageurl?.[selectedImage] || "/default-image.png" }
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
                    className={`product-detail-thumbnail ${selectedImage === index ? "active" : ""}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image || "/placeholder.svg"} alt={`${product.name} ${index + 1}`} />
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
                <span className="product-detail-review-count">({reviewsCount} đánh giá)</span>
                {/* <span className="product-detail-sold-count">
                  {product.sold} đã bán
                </span> */}
              </div>
            </div>

            <div className="product-detail-price">
              <div className="product-detail-current-price">₫{product.product_price?.toLocaleString() || "0"}</div>
              <div className="product-detail-original-price">₫{product.originalPrice?.toLocaleString() || "0"}</div>
              <div className="product-detail-discount">-{product.discount || 0}%</div>
            </div>

            <div className="product-detail-variants">
              {product.variants &&
                product.variants.map((variant, index) => (
                  <div key={index} className="product-detail-variant-group">
                    <label className="product-detail-variant-label">{variant.name}</label>
                    <div className="product-detail-variant-options">
                      {variant.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          className={`product-detail-variant-option ${selectedVariant === option ? "selected" : ""}`}
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
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
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
              <button className="product-detail-add-cart" onClick={handleAddToCart}>
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
              className={`tab ${activeTab === "specifications" ? "active" : ""}`}
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
                    {product?.product_description.split("\n").map((line, index) => (
                      <tr key={index}>
                        <td className="spec-label">{index === 0 ? "Mô tả sản phẩm" : ""}</td>
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
                        {editingReview === review._id ? (
                          // Edit form
                          <div className="edit-review-form">
                            <div className="feedback-rating">
                              <label>Đánh giá của bạn:</label>
                              <div className="star-rating-select">
                                {[...Array(5)].map((_, index) => (
                                  <Star
                                    key={index}
                                    size={20}
                                    className={
                                      index < (editRating || 0) ? "star-filled clickable" : "star-empty clickable"
                                    }
                                    onClick={() => setEditRating(index + 1)}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="feedback-comment">
                              <textarea
                                rows={3}
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                placeholder="Nhập nhận xét của bạn..."
                              ></textarea>
                            </div>

                            <div className="edit-actions">
                              <button
                                className="save-edit-btn"
                                onClick={() => handleUpdateFeedback(review._id)}
                                disabled={submitting}
                              >
                                {submitting ? "Đang lưu..." : "Lưu"}
                              </button>
                              <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="review-header">
                              <div className="reviewer-info">
                                <span className="reviewer-name">
                                  {review.user_id ? review.user_id.username : "Anonymous"}
                                </span>
                                <div className="review-rating">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      color={i < review.rating ? "gold" : "#ccc"}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="review-actions">
                                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                {/* Chỉ hiển thị nút edit/delete cho review của user hiện tại */}
                                {review.user_id?._id === user?.id && (
                                  <div className="review-buttons">
                                    <button
                                      className="edit-review-btn"
                                      onClick={() => {
                                        setEditingReview(review._id)
                                        setEditRating(review.rating)
                                        setEditComment(review.comment)
                                      }}
                                      title="Sửa đánh giá"
                                    >
                                      <FiEdit size={16} color="blue" />
                                    </button>
                                    <button
                                      className="delete-review-btn"
                                      onClick={() => handleDeleteFeedback(review._id)}
                                      title="Xóa đánh giá"
                                    >
                                      <RiDeleteBinLine size={16} color="red" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="review-content">
                              <p>{review.comment}</p>
                              {review.images && review.images.length > 0 && (
                                <div className="review-images">
                                  {review.images.map((image, index) => (
                                    <img key={index} src={image || "/placeholder.svg"} alt={`Review ${index + 1}`} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
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
                    <img src={item.product_imageurl[0] || "/placeholder.svg"} alt={item.product_name} />
                  </div>
                  <div className="related-info">
                    <h4>{item.product_name}</h4>
                    <div className="related-price">₫{item.product_price.toLocaleString()}</div>
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
  )
}

export default ProductDetail
