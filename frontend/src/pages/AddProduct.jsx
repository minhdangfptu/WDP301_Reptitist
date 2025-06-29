import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { baseUrl } from '../config';
const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const categoryIdFromState = location.state?.categoryId || "";

  const [form, setForm] = useState({
    product_name: "",
    product_price: "",
    product_description: "",
    product_quantity: "",
    product_imageurl: [""],
    product_category_id: categoryIdFromState,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...form.product_imageurl];
    newImages[index] = value;
    setForm((prev) => ({ ...prev, product_imageurl: newImages }));
  };

  const addImageField = () => {
    setForm((prev) => ({
      ...prev,
      product_imageurl: [...prev.product_imageurl, ""],
    }));
  };

  const removeImageField = (index) => {
    const newImages = [...form.product_imageurl];
    newImages.splice(index, 1);
    setForm((prev) => ({ ...prev, product_imageurl: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.product_name ||
      !form.product_price ||
      !form.product_quantity ||
      !form.product_category_id
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      await axios.post(
        `${baseUrl}/reptitist/shop/products/create`,
        form
      );
      alert("Thêm sản phẩm thành công!");
      navigate(`/products-by-category/${form.product_category_id}`);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi thêm sản phẩm.");
    }
  };

  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="mb-4 text-center">Thêm sản phẩm mới</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên sản phẩm *</label>
            <input
              type="text"
              name="product_name"
              className="form-control"
              value={form.product_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Giá *</label>
            <input
              type="number"
              name="product_price"
              className="form-control"
              value={form.product_price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Số lượng *</label>
            <input
              type="number"
              name="product_quantity"
              className="form-control"
              value={form.product_quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea
              name="product_description"
              className="form-control"
              rows="3"
              value={form.product_description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Hình ảnh</label>
            {form.product_imageurl.map((img, index) => (
              <div key={index} className="d-flex mb-2">
                <input
                  type="text"
                  value={img}
                  className="form-control me-2"
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="URL hình ảnh"
                />
                {form.product_imageurl.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeImageField(index)}
                  >
                    
                  </button>
                )}
              </div>
            ))}
            
          </div>

          <button type="submit" className="btn btn-success mt-3">
            Lưu sản phẩm
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AddProduct;