import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { baseUrl } from '../config';
import { useAuth } from '../context/AuthContext';

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${baseUrl}/reptitist/shop/category`);
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Lỗi khi tải danh sách danh mục");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading)
    return <div className="text-center my-5">Đang tải dữ liệu...</div>;
  if (error)
    return <div className="text-danger text-center my-5">{error}</div>;

  return (
    <>
      <Header />
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">🛍️ Danh mục sản phẩm</h2>
          {hasRole('admin') && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/admin/categories')}
            >
              <i className="fas fa-cog"></i>
              Quản lý danh mục
            </button>
          )}
        </div>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {categories.map((category) => (
            <div className="col" key={category._id}>
              <div
                className="card h-100 shadow-sm border-0 d-flex flex-column"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/products/category/${category._id}`)}
              >
                <img
                  src={category.product_category_imageurl || "/default.jpg"}
                  className="card-img-top"
                  alt={category.product_category_name}
                  style={{
                    height: "200px",
                    objectFit: "cover",
                    borderTopLeftRadius: "0.5rem",
                    borderTopRightRadius: "0.5rem",
                  }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 style={{marginLeft: '-950px'}} className="card-title text-primary">
                    {category.product_category_name}
                  </h5>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-12 text-center mt-4">
              <p>Không có danh mục nào để hiển thị.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductCategories;
