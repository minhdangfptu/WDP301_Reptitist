
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Search, User, HelpCircle, Facebook, Star, Truck, Shield, Award, RotateCcw, Minus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const { user } = useAuth();
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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ reason: '', description: '' });
  const [submittingReport, setSubmittingReport] = useState(false);

  const renderStars = (rating, size = 'small') => {
    const starSize = size === 'large' ? 24 : 16;
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={starSize}
        className={i < Math.floor(rating) ? 'product-detail-star-filled' : 'product-detail-star-empty'}
      />
    ));
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    toast.success("Đã gửi đánh giá");
    setSubmittingReview(false);
    setShowReviewForm(false);
  };

  const handleSubmitReport = async () => {
    setSubmittingReport(true);
    toast.success("Đã gửi báo cáo");
    setSubmittingReport(false);
    setShowReportModal(false);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/reptitist/shop/products/detail/${productId}`);
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
        const response = await axios.get(`http://localhost:8080/reptitist/shop/products-feedbacks/${productId}`);
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

  return (
    <>
      {/* Your JSX layout goes here */}
      <ToastContainer />
    </>
  );
};

export default ProductDetail;
