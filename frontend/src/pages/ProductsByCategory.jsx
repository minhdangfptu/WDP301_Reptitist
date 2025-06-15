import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const ProductsByCategory = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/reptitist/shop/products/category/${categoryId}`
        );
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Lỗi khi tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  const newestProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  if (loading) return <div className="text-center my-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-danger text-center my-5">{error}</div>;

  return (
    <>
      <Header />
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>📦 Sản phẩm trong danh mục</h2>
          <button
            className="btn btn-success"
            onClick={() => navigate("/products/create")}
          >
            Thêm sản phẩm
          </button>
        </div>

        {/* 🌟 Sản phẩm mới nhất */}
        <h1 style={{display: 'flex', justifyContent: 'center'}} className="mb-3"> Sản phẩm mới nhất</h1>
        {newestProducts.length === 0 && <p>Chưa có sản phẩm mới nào.</p>}
        <div className="row row-cols-1 row-cols-md-3 g-4 mb-5">
          {newestProducts.map((product) => (
            <div className="col" key={product._id}>
              <div className="card h-100 shadow-sm border-0 d-flex flex-column">
                <div
                  className="d-flex overflow-auto px-3 pt-3"
                  style={{ gap: "0.5rem" }}
                >
                  {product.product_imageurl?.length > 0 ? (
                    product.product_imageurl.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`${product.product_name} - ${idx + 1}`}
                        style={{
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "0.5rem",
                          flexShrink: 0,
                        }}
                      />
                    ))
                  ) : (
                    <img
                      src="/default.jpg"
                      alt="default"
                      style={{
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                      }}
                    />
                  )}
                </div>
                <div className="card-body d-flex flex-column mt-2">
                  <h5 style={{marginLeft: '-950px'}} className="card-title text-primary">{product.product_name}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {product.product_description || "Chưa có mô tả"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 📋 Tất cả sản phẩm */}
        <br></br>
        <hr></hr>
        <h1 style={{display: 'flex', justifyContent: 'center'}} className="mb-3"> Tất cả sản phẩm</h1>
        {products.length === 0 && (
          <p>Không có sản phẩm nào trong danh mục này.</p>
        )}
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {products.map((product) => (
            <div className="col" key={product._id}>
              <div className="card h-100 shadow-sm border-0 d-flex flex-column">
                <div
                  className="d-flex overflow-auto px-3 pt-3"
                  style={{ gap: "0.5rem" }}
                >
                  {product.product_imageurl?.length > 0 ? (
                    product.product_imageurl.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`${product.product_name} - ${idx + 1}`}
                        style={{
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "0.5rem",
                          flexShrink: 0,
                        }}
                      />
                    ))
                  ) : (
                    <img
                      src="/default.jpg"
                      alt="default"
                      style={{
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                      }}
                    />
                  )}
                </div>
                <div className="card-body d-flex flex-column mt-2">
                  <h5 style={{marginLeft: '-950px'}} className="card-title text-primary">{product.product_name}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {product.product_description || "Chưa có mô tả"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductsByCategory;
