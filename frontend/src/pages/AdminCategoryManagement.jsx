import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { baseUrl } from '../config';
import '../css/AdminCategoryManagement.css';

const AdminCategoryManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [formData, setFormData] = useState({
    product_category_name: '',
    product_category_description: '',
    product_category_imageurl: ''
  });

  // Check admin permission
  useEffect(() => {
    if (!hasRole('admin')) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    fetchCategories();
  }, [hasRole, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/reptitist/shop/category`);
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search effect
  useEffect(() => {
    let filtered = [...categories];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.product_category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product_category_name.localeCompare(b.product_category_name);
        case 'name-desc':
          return b.product_category_name.localeCompare(a.product_category_name);
        case 'newest':
          return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
        case 'oldest':
          return new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id);
        default:
          return 0;
      }
    });

    setFilteredCategories(filtered);
  }, [categories, searchTerm, sortBy]);

  const handleCreateCategory = async () => {
    try {
      const response = await axios.post(`${baseUrl}/reptitist/shop/category`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201) {
        toast.success('Tạo danh mục thành công!');
        setShowCreateModal(false);
        setFormData({
          product_category_name: '',
          product_category_description: '',
          product_category_imageurl: ''
        });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Không thể tạo danh mục');
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const response = await axios.put(
        `${baseUrl}/reptitist/shop/category/${selectedCategory._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        toast.success('Cập nhật danh mục thành công!');
        setShowEditModal(false);
        setSelectedCategory(null);
        setFormData({
          product_category_name: '',
          product_category_description: '',
          product_category_imageurl: ''
        });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Không thể cập nhật danh mục');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }

    try {
      const response = await axios.delete(`${baseUrl}/reptitist/shop/category/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 200) {
        toast.success('Xóa danh mục thành công!');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Không thể xóa danh mục');
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      product_category_name: category.product_category_name,
      product_category_description: category.product_category_description || '',
      product_category_imageurl: category.product_category_imageurl || ''
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      product_category_name: '',
      product_category_description: '',
      product_category_imageurl: ''
    });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="admin-category-container">
          <div className="admin-category-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin-category-container">
        <div className="admin-category-header">
          <h1>
            <i className="fas fa-tags"></i>
            Quản lý danh mục sản phẩm
          </h1>
          <p>Quản lý tất cả danh mục sản phẩm trong hệ thống</p>
          <button className="admin-category-create-btn" onClick={openCreateModal}>
            <i className="fas fa-plus"></i>
            Tạo danh mục mới
          </button>
        </div>

        <div className="admin-category-filters">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="sort-filter">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        <div className="admin-category-content">
          {filteredCategories.length === 0 ? (
            <div className="admin-category-empty">
              <i className="fas fa-tags"></i>
              <h3>{searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}</h3>
              <p>{searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy tạo danh mục đầu tiên để bắt đầu'}</p>
            </div>
          ) : (
            <div className="admin-category-grid">
              {filteredCategories.map((category) => (
                <div key={category._id} className="admin-category-card">
                  <div className="admin-category-image">
                    <img
                      src={category.product_category_imageurl || '/default-category.jpg'}
                      alt={category.product_category_name}
                      onError={(e) => {
                        e.target.src = '/default-category.jpg';
                      }}
                    />
                  </div>
                  <div className="admin-category-info">
                    <h3>{category.product_category_name}</h3>
                  </div>
                  <div className="admin-category-actions">
                    <button
                      className="admin-category-edit-btn"
                      onClick={() => openEditModal(category)}
                    >
                      <i className="fas fa-edit"></i>
                      Sửa
                    </button>
                    <button
                      className="admin-category-delete-btn"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      <i className="fas fa-trash"></i>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Category Modal */}
        {showCreateModal && (
          <div className="admin-category-modal-overlay">
            <div className="admin-category-modal">
              <div className="admin-category-modal-header">
                <h3>
                  <i className="fas fa-plus"></i>
                  Tạo danh mục mới
                </h3>
                <button
                  className="admin-category-modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="admin-category-form">
                <div className="admin-category-form-group">
                  <label>Tên danh mục:</label>
                  <input
                    type="text"
                    value={formData.product_category_name}
                    onChange={(e) => setFormData({...formData, product_category_name: e.target.value})}
                    required
                    placeholder="Nhập tên danh mục"
                  />
                </div>
                <div className="admin-category-form-group">
                  <label>URL hình ảnh:</label>
                  <input
                    type="url"
                    value={formData.product_category_imageurl}
                    onChange={(e) => setFormData({...formData, product_category_imageurl: e.target.value})}
                    placeholder="Nhập URL hình ảnh"
                  />
                </div>
              </div>
              <div className="admin-category-modal-footer">
                <button
                  type="button"
                  className="admin-category-modal-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="admin-category-modal-submit"
                  onClick={handleCreateCategory}
                >
                  Tạo danh mục
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && selectedCategory && (
          <div className="admin-category-modal-overlay">
            <div className="admin-category-modal">
              <div className="admin-category-modal-header">
                <h3>
                  <i className="fas fa-edit"></i>
                  Sửa danh mục
                </h3>
                <button
                  className="admin-category-modal-close"
                  onClick={() => setShowEditModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="admin-category-form">
                <div className="admin-category-form-group">
                  <label>Tên danh mục:</label>
                  <input
                    type="text"
                    value={formData.product_category_name}
                    onChange={(e) => setFormData({...formData, product_category_name: e.target.value})}
                    required
                    placeholder="Nhập tên danh mục"
                  />
                </div>
                <div className="admin-category-form-group">
                  <label>URL hình ảnh:</label>
                  <input
                    type="url"
                    value={formData.product_category_imageurl}
                    onChange={(e) => setFormData({...formData, product_category_imageurl: e.target.value})}
                    placeholder="Nhập URL hình ảnh"
                  />
                </div>
              </div>
              <div className="admin-category-modal-footer">
                <button
                  type="button"
                  className="admin-category-modal-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="admin-category-modal-submit"
                  onClick={handleUpdateCategory}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminCategoryManagement;