import { Facebook, HelpCircle, Search, ShoppingCart, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ShopHeader from "../components/ShopHeader";
import { useAuth } from "../context/AuthContext";
import { baseUrl } from "../config";
// Mock data for products
const priceRanges = [
  "Dưới 100.000đ",
  "100.000đ - 300.000đ",
  "300.000đ - 500.000đ",
  "500.000đ - 1.000.000đ",
  "Trên 1.000.000đ",
];

// Loading component
const LoadingSpinner = () => (
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

// Product Card Component
const ProductCard = ({ product }) => (
  <div
    style={{
      backgroundColor: "white",
      borderRadius: "4px",
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      },
    }}
  >
    <div style={{ position: "relative" }}>
      <img
        src={product?.product_imageurl[0] || "/placeholder.svg"}
        alt={product.product_name}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          backgroundColor: "#ffbf00",
          color: "#ee4d2d",
          padding: "2px 6px",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        -{10}%
      </div>
    </div>

    <div style={{ padding: "12px" }}>
      <h3
        style={{
          fontSize: "14px",
          margin: "0 0 8px 0",
          color: "#333",
          lineHeight: "1.4",
          height: "40px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {product.product_name}
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            color: "#ee4d2d",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          ₫
          {typeof product.product_price === "number"
            ? product.product_price.toLocaleString()
            : "Liên hệ"}
        </span>
        {typeof product.product_price === "number" && (
          <span
            style={{
              color: "#999",
              fontSize: "12px",
              textDecoration: "line-through",
            }}
          >
            ₫{product.product_price.toLocaleString()}
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#999",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span>⭐ {product.average_rating}</span>
          <span>|</span>
          <span>Còn lại {product.product_quantity}</span>
        </div>
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#999",
          marginTop: "4px",
        }}
      >
        {product.user_id.address || "Việt Nam"}
      </div>
    </div>
  </div>
);

// Filter Section Component
const FilterSection = ({ title, items, type = "checkbox" }) => (
  <div
    style={{
      marginBottom: "24px",
      paddingBottom: "16px",
      borderBottom: "1px solid #f0f0f0",
    }}
  >
    <h4
      style={{
        fontSize: "14px",
        fontWeight: "bold",
        marginBottom: "12px",
        color: "#333",
      }}
    >
      {title}
    </h4>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map((item, index) => (
        <label
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "13px",
            color: "#555",
          }}
        >
          <input
            type={type}
            name={type === "radio" ? title : undefined}
            style={{ margin: 0 }}
          />
          {item}
        </label>
      ))}
    </div>
  </div>
);

// Main Shopee Page Component
const ListProductPage = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [cate, setCate] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const { productName, categoryId } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response;
        if (productName) {
          response = await axios.get(
            `${baseUrl}/reptitist/shop/products/search/${productName}`
          );
        } else if (categoryId) {
          response = await axios.get(
            `${baseUrl}/reptitist/shop/products/category/${categoryId}`
          );
        } else {
          response = await axios.get(`${baseUrl}/reptitist/shop/products`);
        }
        setProducts(response.data);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [productName, categoryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (categoryId) {
          const currentCateResponse = await axios.get(
            `${baseUrl}/reptitist/shop/category/${categoryId}`
          );
          setCate(currentCateResponse.data);
        }
      } catch (err) {
        setError("Không thể tải danh mục hiện tại");
        console.error("Lỗi khi tải danh mục hiện tại:", err);
      }
    };
    fetchCategories();
  }, [categoryId]);

  // useEffect mới để fetch tất cả danh mục
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await axios.get(`${baseUrl}/reptitist/shop/category`);
        setAllCategories(response.data);
      } catch (err) {
        console.error("Lỗi khi tải tất cả danh mục:", err);
      }
    };

    fetchAllCategories();
  }, []); // Chỉ chạy một lần khi component mount
  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <ShopHeader />

      {/* Breadcrumb */}
      <div
        style={{
          backgroundColor: "white",
          padding: "12px 0",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
            fontSize: "13px",
            color: "#555",
          }}
        >
          Reptitist Shop &gt; {productName || cate.product_category_name}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px",
          display: "flex",
          gap: "16px",
        }}
      >
        {/* Sidebar Filters */}
        <aside
          style={{
            width: "200px",
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "4px",
            height: "fit-content",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#333",
            }}
          >
            Bộ lọc tìm kiếm
          </h3>

          <FilterSection
            title="Danh Mục"
            items={allCategories.map((cat) => cat.product_category_name)}
          />
          <FilterSection title="Khoảng Giá" items={priceRanges} type="radio" />

          <div style={{ marginBottom: "16px" }}>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "12px",
                color: "#333",
              }}
            >
              Đánh Giá
            </h4>
            {[5, 4, 3].map((stars) => (
              <label
                key={stars}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                <input type="checkbox" />
                <span>{"⭐".repeat(stars)} trở lên</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Main Product Area */}
        <main style={{ flex: 1 }}>
          {/* Category Header */}
          <div
            style={{
              backgroundColor: "white",
              padding: "16px",
              borderRadius: "4px",
              marginBottom: "16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
                margin: 0,
              }}
            >
              {productName
                ? `Sản phẩm: ${productName}`
                : `Danh mục: ${cate.product_category_name}`}
            </h1>
          </div>

          {/* Sort Bar */}
          <div
            style={{
              backgroundColor: "white",
              padding: "12px 16px",
              borderRadius: "4px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <span style={{ fontSize: "14px", color: "#555" }}>
              Sắp xếp theo
            </span>
            <button
              style={{
                padding: "8px 16px",
                border: "1px solid #00843d",
                backgroundColor: "#00843d",
                color: "white",
                borderRadius: "2px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Phổ Biến
            </button>
            <button
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                backgroundColor: "white",
                color: "#555",
                borderRadius: "2px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Mới Nhất
            </button>
            <button
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                backgroundColor: "white",
                color: "#555",
                borderRadius: "2px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Bán Chạy
            </button>
            <select
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "2px",
                fontSize: "13px",
                backgroundColor: "white",
              }}
            >
              <option>Giá: Thấp đến Cao</option>
              <option>Giá: Cao đến Thấp</option>
            </select>
          </div>

          {/* Products Grid */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product-detail/${product._id}`}
                  style={{ textDecoration: "none" }}
                >
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "32px",
                padding: "16px",
              }}
            >
              <button
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                ‹
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    backgroundColor: page === 1 ? "#00843d" : "white",
                    color: page === 1 ? "white" : "#333",
                    borderRadius: "2px",
                    cursor: "pointer",
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                ›
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ListProductPage;
