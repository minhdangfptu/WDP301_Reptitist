import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import '../css/LibraryManagement.css';
const baseUrl = import.meta.env.VITE_BACKEND_URL;
const LibraryManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showContentDetailModal, setShowContentDetailModal] = useState(false);
  const [showCreateContentModal, setShowCreateContentModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  
  // Form states
  const [topicForm, setTopicForm] = useState({
    topic_title: '',
    topic_description: '',
    topic_imageurl: ['']
  });
  
  const [categoryForm, setCategoryForm] = useState({
    category_content: '',
    category_description: '',
    category_imageurl: '',
    topic_id: ''
  });
  
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    image_urls: [''],
    topic_id: '',
    category_id: ''
  });
  
  const [formLoading, setFormLoading] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalCategories: 0,
    totalContents: 0,
    recentContents: 0
  });

  const searchInputRef = useRef(null);

  // Check admin permission
  useEffect(() => {
    if (!hasRole('admin')) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
    initializeData();
  }, [hasRole, navigate]);

  // Initialize all data
  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchContents(),
        fetchTopics(),
        fetchCategories()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch library contents
  const fetchContents = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/reptitist/library_contents`);
      if (response.data) {
        setContents(response.data);
        setFilteredContents(response.data);
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
      toast.error('Không thể tải danh sách nội dung thư viện');
      setContents([]);
      setFilteredContents([]);
    }
  }, []);

  // Fetch topics
  const fetchTopics = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/reptitist/library_topics`);
      if (response.data) {
        setTopics(response.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Không thể tải danh sách chủ đề');
      setTopics([]);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/reptitist/library_categories`);
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
      setCategories([]);
    }
  }, []);

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const totalTopics = topics.length;
    const totalCategories = categories.length;
    const totalContents = contents.length;
    
    // Recent contents (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentContents = contents.filter(content => {
      const contentDate = new Date(content.createdAt);
      return contentDate >= sevenDaysAgo;
    }).length;

    setStats({
      totalTopics,
      totalCategories,
      totalContents,
      recentContents
    });
  }, [topics, categories, contents]);

  // Update stats when data changes
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Filter by date range
  const filterByDateRange = useCallback((contentsList, dateFilter) => {
    if (dateFilter === 'all') return contentsList;

    const now = new Date();
    const startDate = new Date();

    switch (dateFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return contentsList;
    }

    return contentsList.filter(content => {
      const contentDate = new Date(content.createdAt || content.updatedAt);
      return contentDate >= startDate;
    });
  }, []);

  // Enhanced filter and search functionality
  useEffect(() => {
    let filtered = [...contents];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(content =>
        content.title?.toLowerCase().includes(searchLower) ||
        content._id?.toLowerCase().includes(searchLower) ||
        (content.content && content.content.toLowerCase().includes(searchLower)) ||
        (content.user_id?.username && content.user_id.username.toLowerCase().includes(searchLower))
      );
    }

    // Topic filter
    if (filterTopic !== 'all') {
      filtered = filtered.filter(content => content.topic_id?._id === filterTopic);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(content => content.category_id?._id === filterCategory);
    }

    // Author filter
    if (filterAuthor !== 'all') {
      filtered = filtered.filter(content => content.user_id?._id === filterAuthor);
    }

    // Date filter
    filtered = filterByDateRange(filtered, filterDate);

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(a[sortField] || 0);
        bValue = new Date(b[sortField] || 0);
      } else if (sortField === 'title') {
        aValue = a.title || '';
        bValue = b.title || '';
      } else if (sortField === 'author') {
        aValue = a.user_id?.username || '';
        bValue = b.user_id?.username || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredContents(filtered);
    setCurrentPage(1);
  }, [contents, searchTerm, filterTopic, filterCategory, filterAuthor, filterDate, sortField, sortDirection, filterByDateRange]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContents = filteredContents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContents.length / itemsPerPage);

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle view content details
  const handleViewContentDetails = (content) => {
    setSelectedContent(content);
    setShowContentDetailModal(true);
  };

  // Handle delete content
  const handleDeleteContent = (content) => {
    setSelectedContent(content);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedContent) return;

    try {
      const response = await axios.delete(
        `${baseUrl}/reptitist/library_contents/${selectedContent._id}`
      );

      if (response.status === 200) {
        toast.success('Xóa nội dung thành công');
        await fetchContents();
        setShowDeleteModal(false);
        setSelectedContent(null);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa nội dung');
    }
  };

  // Handle create topic
  const handleCreateTopic = async () => {
    if (!topicForm.topic_title.trim()) {
      toast.error('Vui lòng nhập tiêu đề chủ đề');
      return;
    }

    try {
      setFormLoading(true);
      const response = await axios.post(
        `${baseUrl}/reptitist/library_topics`,
        topicForm,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        toast.success('Tạo chủ đề thành công');
        await fetchTopics();
        setTopicForm({
          topic_title: '',
          topic_description: '',
          topic_imageurl: ['']
        });
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo chủ đề');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle create category
  const handleCreateCategory = async () => {
    if (!categoryForm.category_content.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      setFormLoading(true);
      const response = await axios.post(
        `${baseUrl}/reptitist/library_categories`,
        categoryForm,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        toast.success('Tạo danh mục thành công');
        await fetchCategories();
        setCategoryForm({
          category_content: '',
          category_description: '',
          category_imageurl: '',
          topic_id: ''
        });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo danh mục');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle create content
  const handleCreateContent = async () => {
    if (!contentForm.title.trim() || !contentForm.content.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    try {
      setFormLoading(true);
      const formData = {
        ...contentForm,
        user_id: user?.id
      };

      const response = await axios.post(
        `${baseUrl}/reptitist/library_contents`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        toast.success('Tạo nội dung thành công');
        await fetchContents();
        setContentForm({
          title: '',
          content: '',
          image_urls: [''],
          topic_id: '',
          category_id: ''
        });
        setShowCreateContentModal(false);
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo nội dung');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete topic
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${baseUrl}/reptitist/library_topics/${topicId}`
      );

      if (response.status === 200) {
        toast.success('Xóa chủ đề thành công');
        await fetchTopics();
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa chủ đề');
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${baseUrl}/reptitist/library_categories/${categoryId}`
      );

      if (response.status === 200) {
        toast.success('Xóa danh mục thành công');
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Get topic name
  const getTopicName = (topicId) => {
    const topic = topics.find(t => t._id === topicId);
    return topic ? topic.topic_title : 'N/A';
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.category_content : 'N/A';
  };

  // Get unique authors
  const getUniqueAuthors = () => {
    const authors = contents.reduce((acc, content) => {
      if (content.user_id && !acc.find(a => a._id === content.user_id._id)) {
        acc.push(content.user_id);
      }
      return acc;
    }, []);
    return authors;
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterTopic('all');
    setFilterCategory('all');
    setFilterAuthor('all');
    setFilterDate('all');
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Render pagination
  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => setCurrentPage(1)}
          className="lm-pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-dots" className="lm-pagination-dots">...</span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`lm-pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-dots" className="lm-pagination-dots">...</span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="lm-pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  // Check admin access
  if (!hasRole('admin')) {
    return (
      <>
        <Header />
        <div className="lm-container">
          <div className="lm-no-access">
            <i className="fas fa-exclamation-triangle lm-warning-icon"></i>
            <h2>Không có quyền truy cập</h2>
            <p>Bạn không có quyền xem trang này. Chỉ có Admin mới có thể truy cập.</p>
            <Link to="/" className="lm-btn lm-btn-primary">
              <i className="fas fa-home"></i>
              Về trang chủ
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="lm-container">
        {/* Page Header */}
        <div className="lm-page-header">
          <div className="lm-page-header-content">
            <div className="lm-page-header-text">
              <h1>
                <i className="fas fa-book-open"></i>
                Quản lý thư viện
              </h1>
              <p>Quản lý chủ đề, danh mục và nội dung thư viện kiến thức</p>
              <div className="lm-header-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý thư viện</span>
              </div>
            </div>
            <div className="lm-header-actions">
              <button 
                onClick={() => setShowCreateContentModal(true)}
                className="lm-btn lm-btn-primary"
              >
                <i className="fas fa-plus"></i>
                Thêm nội dung
              </button>
              <button 
                onClick={() => setShowTopicModal(true)}
                className="lm-btn lm-btn-secondary"
              >
                <i className="fas fa-sitemap"></i>
                Quản lý chủ đề
              </button>
              <button 
                onClick={() => setShowCategoryModal(true)}
                className="lm-btn lm-btn-secondary"
              >
                <i className="fas fa-tags"></i>
                Quản lý danh mục
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="lm-stats-dashboard">
          <div className="lm-stats-grid">
            <div className="lm-stat-card lm-stat-topics">
              <div className="lm-stat-icon">
                <i className="fas fa-sitemap"></i>
              </div>
              <div className="lm-stat-content">
                <span className="lm-stat-number">{stats.totalTopics}</span>
                <span className="lm-stat-label">Chủ đề</span>
              </div>
            </div>
            
            <div className="lm-stat-card lm-stat-categories">
              <div className="lm-stat-icon">
                <i className="fas fa-tags"></i>
              </div>
              <div className="lm-stat-content">
                <span className="lm-stat-number">{stats.totalCategories}</span>
                <span className="lm-stat-label">Danh mục</span>
              </div>
            </div>

            <div className="lm-stat-card lm-stat-contents">
              <div className="lm-stat-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="lm-stat-content">
                <span className="lm-stat-number">{stats.totalContents}</span>
                <span className="lm-stat-label">Nội dung</span>
              </div>
            </div>

            <div className="lm-stat-card lm-stat-recent">
              <div className="lm-stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="lm-stat-content">
                <span className="lm-stat-number">{stats.recentContents}</span>
                <span className="lm-stat-label">Mới trong tuần</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="lm-filters-section">
          <div className="lm-filters-row">
            <div className="lm-search-box">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="lm-search-input"
              />
              <i className="fas fa-search lm-search-icon"></i>
            </div>
            
            <div className="lm-filter-group">
              <label>Chủ đề:</label>
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="lm-filter-select"
              >
                <option value="all">Tất cả chủ đề</option>
                {topics.map(topic => (
                  <option key={topic._id} value={topic._id}>
                    {topic.topic_title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="lm-filter-group">
              <label>Danh mục:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="lm-filter-select"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.category_content}
                  </option>
                ))}
              </select>
            </div>

            <div className="lm-filter-group">
              <label>Tác giả:</label>
              <select
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                className="lm-filter-select"
              >
                <option value="all">Tất cả tác giả</option>
                {getUniqueAuthors().map(author => (
                  <option key={author._id} value={author._id}>
                    {author.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="lm-filter-group">
              <label>Thời gian:</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="lm-filter-select"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="quarter">3 tháng qua</option>
                <option value="year">Năm nay</option>
              </select>
            </div>

            <div className="lm-filter-group">
              <label>Hiển thị:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="lm-filter-select"
              >
                <option value={10}>10 mục</option>
                <option value={25}>25 mục</option>
                <option value={50}>50 mục</option>
                <option value={100}>100 mục</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="lm-btn lm-btn-secondary lm-reset-btn"
              title="Đặt lại bộ lọc"
            >
              <i className="fas fa-undo"></i>
              Đặt lại
            </button>
          </div>

          {/* Filter Summary */}
          {(searchTerm || filterTopic !== 'all' || filterCategory !== 'all' || filterAuthor !== 'all' || filterDate !== 'all') && (
            <div className="lm-filter-summary">
              <div className="lm-filter-results">
                <span>Hiển thị {filteredContents.length} / {contents.length} nội dung</span>
              </div>
              <div className="lm-filter-tags">
                {searchTerm && (
                  <span className="lm-filter-tag">
                    <i className="fas fa-search"></i>
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>×</button>
                  </span>
                )}
                {filterTopic !== 'all' && (
                  <span className="lm-filter-tag">
                    <i className="fas fa-sitemap"></i>
                    {getTopicName(filterTopic)}
                    <button onClick={() => setFilterTopic('all')}>×</button>
                  </span>
                )}
                {filterCategory !== 'all' && (
                  <span className="lm-filter-tag">
                    <i className="fas fa-tags"></i>
                    {getCategoryName(filterCategory)}
                    <button onClick={() => setFilterCategory('all')}>×</button>
                  </span>
                )}
                {filterAuthor !== 'all' && (
                  <span className="lm-filter-tag">
                    <i className="fas fa-user"></i>
                    {getUniqueAuthors().find(a => a._id === filterAuthor)?.username}
                    <button onClick={() => setFilterAuthor('all')}>×</button>
                  </span>
                )}
                {filterDate !== 'all' && (
                  <span className="lm-filter-tag">
                    <i className="fas fa-calendar"></i>
                    {filterDate}
                    <button onClick={() => setFilterDate('all')}>×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Library Contents Table */}
        <div className="lm-table-section">
          {loading ? (
            <div className="lm-loading-state">
              <div className="lm-spinner"></div>
              <h3>Đang tải dữ liệu...</h3>
              <p>Vui lòng chờ trong giây lát</p>
            </div>
          ) : currentContents.length === 0 ? (
            <div className="lm-empty-state">
              <i className="fas fa-book-open lm-empty-icon"></i>
              <h3>Không tìm thấy nội dung</h3>
              <p>
                {filteredContents.length === 0 && contents.length === 0 
                  ? 'Chưa có nội dung nào trong thư viện' 
                  : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                }
              </p>
              {filteredContents.length === 0 && contents.length > 0 ? (
                <button onClick={resetFilters} className="lm-btn lm-btn-primary">
                  <i className="fas fa-refresh"></i>
                  Đặt lại bộ lọc
                </button>
              ) : (
                <button onClick={() => setShowCreateContentModal(true)} className="lm-btn lm-btn-primary">
                  <i className="fas fa-plus"></i>
                  Thêm nội dung đầu tiên
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="lm-table-header">
                <h3>
                  <i className="fas fa-table"></i>
                  Danh sách nội dung ({filteredContents.length})
                </h3>
                <div className="lm-table-actions">
                  <button 
                    onClick={() => initializeData()} 
                    className="lm-btn lm-btn-secondary"
                    title="Làm mới dữ liệu"
                    disabled={loading}
                  >
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                  </button>
                </div>
              </div>

              <div className="lm-table-container">
                <table className="lm-library-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('title')} className="lm-sortable">
                        <span>Thông tin nội dung</span>
                        {sortField === 'title' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Chủ đề / Danh mục</th>
                      <th onClick={() => handleSort('author')} className="lm-sortable">
                        <span>Tác giả</span>
                        {sortField === 'author' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('createdAt')} className="lm-sortable">
                        <span>Ngày tạo</span>
                        {sortField === 'createdAt' && (
                          <i className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentContents.map((content) => (
                      <tr key={content._id} className="lm-table-row">
                        <td className="lm-content-info">
                          <div className="lm-content-main">
                            <img
                              src={content.image_urls?.[0] || '/default-article.png'}
                              alt={content.title}
                              className="lm-content-image"
                              onError={(e) => {
                                e.target.src = '/default-article.png';
                              }}
                            />
                            <div className="lm-content-details">
                              <h4 className="lm-content-title" title={content.title}>
                                {content.title}
                              </h4>
                              <p className="lm-content-id">ID: {content._id}</p>
                              {content.content && (
                                <p className="lm-content-summary" title={content.content}>
                                  {content.content.length > 100 
                                    ? `${content.content.substring(0, 100)}...` 
                                    : content.content
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <div>
                            <span className="lm-topic-badge">
                              {content.topic_id?.topic_title || 'N/A'}
                            </span>
                            <br />
                            <span className="lm-category-badge">
                              {content.category_id?.category_content || 'N/A'}
                            </span>
                          </div>
                        </td>
                        
                        <td>
                          <div className="lm-author-info">
                            <img
                              src={content.user_id?.user_imageurl || '/default-avatar.png'}
                              alt={content.user_id?.username}
                              className="lm-author-avatar"
                              onError={(e) => {
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                            <div className="lm-author-details">
                              <span className="lm-author-name">
                                {content.user_id?.username || 'N/A'}
                              </span>
                              <span className="lm-author-role">
                                {content.user_id?.role_id?.role_name || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <div className="lm-date-info">
                            <span className="lm-date-value">
                              {formatDate(content.createdAt)}
                            </span>
                            {content.updatedAt && content.updatedAt !== content.createdAt && (
                              <span className="lm-updated-label">
                                Sửa: {formatDate(content.updatedAt)}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td>
                          <div className="lm-action-buttons">
                            <button
                              onClick={() => handleViewContentDetails(content)}
                              className="lm-btn lm-btn-icon lm-btn-view"
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            
                            <button
                              onClick={() => handleDeleteContent(content)}
                              className="lm-btn lm-btn-icon lm-btn-delete"
                              title="Xóa nội dung"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="lm-pagination">
                  <div className="lm-pagination-info">
                    Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredContents.length)} của {filteredContents.length} nội dung
                  </div>
                  
                  <div className="lm-pagination-controls">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="lm-pagination-btn lm-pagination-prev"
                    >
                      <i className="fas fa-chevron-left"></i>
                      Trước
                    </button>
                    
                    <div className="lm-pagination-numbers">
                      {renderPagination()}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="lm-pagination-btn lm-pagination-next"
                    >
                      Sau
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedContent && (
          <div className="lm-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="lm-modal lm-delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lm-modal-header">
                <h3>
                  <i className="fas fa-exclamation-triangle"></i>
                  Xác nhận xóa nội dung
                </h3>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="lm-modal-close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="lm-modal-body">
                <div className="lm-delete-warning">
                  <p>Bạn có chắc chắn muốn xóa nội dung này không?</p>
                  <div className="lm-content-preview">
                    <img 
                      src={selectedContent.image_urls?.[0] || '/default-article.png'} 
                      alt={selectedContent.title}
                      className="lm-preview-image"
                    />
                    <div className="lm-preview-info">
                      <h4>{selectedContent.title}</h4>
                      <p>ID: {selectedContent._id}</p>
                      <p>Tác giả: {selectedContent.user_id?.username}</p>
                    </div>
                  </div>
                  <div className="lm-warning-text">
                    <i className="fas fa-exclamation-triangle"></i>
                    <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
                  </div>
                </div>
              </div>
              
              <div className="lm-modal-footer">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="lm-btn lm-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="lm-btn lm-btn-danger"
                >
                  <i className="fas fa-trash"></i>
                  Xóa nội dung
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Detail Modal */}
        {showContentDetailModal && selectedContent && (
          <div className="lm-modal-overlay" onClick={() => setShowContentDetailModal(false)}>
            <div className="lm-modal lm-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lm-modal-header">
                <h3>
                  <i className="fas fa-info-circle"></i>
                  Chi tiết nội dung
                </h3>
                <button 
                  onClick={() => setShowContentDetailModal(false)}
                  className="lm-modal-close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="lm-modal-body lm-detail-body">
                <div className="lm-detail-grid">
                  <div className="lm-detail-image">
                    <img 
                      src={selectedContent.image_urls?.[0] || '/default-article.png'} 
                      alt={selectedContent.title}
                      className="lm-detail-main-image"
                    />
                  </div>
                  
                  <div className="lm-detail-info">
                    <h4 className="lm-detail-title">{selectedContent.title}</h4>
                    
                    <div className="lm-detail-fields">
                      <div className="lm-detail-field">
                        <label>Mã nội dung:</label>
                        <span>{selectedContent._id}</span>
                      </div>
                      
                      <div className="lm-detail-field">
                        <label>Chủ đề:</label>
                        <span className="lm-topic-badge">
                          {selectedContent.topic_id?.topic_title || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="lm-detail-field">
                        <label>Danh mục:</label>
                        <span className="lm-category-badge">
                          {selectedContent.category_id?.category_content || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="lm-detail-field">
                        <label>Tác giả:</label>
                        <span>{selectedContent.user_id?.username || 'N/A'}</span>
                      </div>
                      
                      <div className="lm-detail-field">
                        <label>Ngày tạo:</label>
                        <span>{formatDate(selectedContent.createdAt)}</span>
                      </div>
                      
                      {selectedContent.updatedAt && selectedContent.updatedAt !== selectedContent.createdAt && (
                        <div className="lm-detail-field">
                          <label>Cập nhật cuối:</label>
                          <span>{formatDate(selectedContent.updatedAt)}</span>
                        </div>
                      )}
                      
                      {selectedContent.content && (
                        <div className="lm-detail-field lm-detail-content">
                          <label>Nội dung:</label>
                          <div className="lm-detail-content-text">
                            {selectedContent.content}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lm-modal-footer">
                <button 
                  onClick={() => setShowContentDetailModal(false)}
                  className="lm-btn lm-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Topic Management Modal */}
        {showTopicModal && (
          <div className="lm-modal-overlay" onClick={() => setShowTopicModal(false)}>
            <div className="lm-modal lm-management-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lm-modal-header">
                <h3>
                  <i className="fas fa-sitemap"></i>
                  Quản lý chủ đề
                </h3>
                <button 
                  onClick={() => setShowTopicModal(false)}
                  className="lm-modal-close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="lm-modal-body">
                {/* Create Topic Form */}
                <div className="lm-management-form">
                  <h4>Thêm chủ đề mới</h4>
                  <div className="lm-form-group">
                    <label>Tiêu đề chủ đề:</label>
                    <input
                      type="text"
                      value={topicForm.topic_title}
                      onChange={(e) => setTopicForm({
                        ...topicForm,
                        topic_title: e.target.value
                      })}
                      placeholder="Nhập tiêu đề chủ đề..."
                      className="lm-form-input"
                    />
                  </div>
                  
                  <div className="lm-form-group">
                    <label>Mô tả:</label>
                    <textarea
                      value={topicForm.topic_description}
                      onChange={(e) => setTopicForm({
                        ...topicForm,
                        topic_description: e.target.value
                      })}
                      placeholder="Nhập mô tả chủ đề..."
                      className="lm-form-input lm-form-textarea"
                    />
                  </div>
                  
                  <div className="lm-form-group">
                    <label>URL hình ảnh:</label>
                    <input
                      type="url"
                      value={topicForm.topic_imageurl[0]}
                      onChange={(e) => setTopicForm({
                        ...topicForm,
                        topic_imageurl: [e.target.value]
                      })}
                      placeholder="https://example.com/image.jpg"
                      className="lm-form-input"
                    />
                  </div>
                  
                  <button
                    onClick={handleCreateTopic}
                    disabled={formLoading || !topicForm.topic_title.trim()}
                    className="lm-btn lm-btn-primary"
                  >
                    {formLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus"></i>
                        Thêm chủ đề
                      </>
                    )}
                  </button>
                </div>

                {/* Topics List */}
                <div className="lm-items-list">
                  <h4>Danh sách chủ đề ({topics.length})</h4>
                  {topics.length === 0 ? (
                    <div className="lm-empty-list">
                      <i className="fas fa-sitemap"></i>
                      <p>Chưa có chủ đề nào</p>
                    </div>
                  ) : (
                    <div className="lm-items-grid">
                      {topics.map(topic => {
                        const contentCount = contents.filter(c => c.topic_id?._id === topic._id).length;
                        
                        return (
                          <div key={topic._id} className="lm-item-card">
                            <div className="lm-item-image">
                              <img
                                src={topic.topic_imageurl?.[0] || '/default-topic.png'}
                                alt={topic.topic_title}
                                onError={(e) => {
                                  e.target.src = '/default-topic.png';
                                }}
                              />
                            </div>
                            
                            <div className="lm-item-info">
                              <h5>{topic.topic_title}</h5>
                              <p>{topic.topic_description || 'Chưa có mô tả'}</p>
                              <small>ID: {topic._id}</small>
                            </div>
                            
                            <div className="lm-item-meta">
                              <span className="lm-item-count">{contentCount} nội dung</span>
                            </div>
                            
                            <div className="lm-item-actions">
                              <button
                                onClick={() => handleDeleteTopic(topic._id)}
                                className="lm-btn lm-btn-icon lm-btn-delete"
                                title="Xóa chủ đề"
                                disabled={contentCount > 0}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                            
                            {contentCount > 0 && (
                              <div className="lm-item-warning">
                                <i className="fas fa-info-circle"></i>
                                Không thể xóa do còn {contentCount} nội dung
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lm-modal-footer">
                <button 
                  onClick={() => setShowTopicModal(false)}
                  className="lm-btn lm-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Management Modal */}
        {showCategoryModal && (
          <div className="lm-modal-overlay" onClick={() => setShowCategoryModal(false)}>
            <div className="lm-modal lm-management-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lm-modal-header">
                <h3>
                  <i className="fas fa-tags"></i>
                  Quản lý danh mục
                </h3>
                <button 
                  onClick={() => setShowCategoryModal(false)}
                  className="lm-modal-close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="lm-modal-body">
                {/* Create Category Form */}
                <div className="lm-management-form">
                  <h4>Thêm danh mục mới</h4>
                  <div className="lm-form-group">
                    <label>Tên danh mục:</label>
                    <input
                      type="text"
                      value={categoryForm.category_content}
                      onChange={(e) => setCategoryForm({
                        ...categoryForm,
                        category_content: e.target.value
                      })}
                      placeholder="Nhập tên danh mục..."
                      className="lm-form-input"
                    />
                  </div>
                  
                  <div className="lm-form-group">
                    <label>Mô tả:</label>
                    <textarea
                      value={categoryForm.category_description}
                      onChange={(e) => setCategoryForm({
                        ...categoryForm,
                        category_description: e.target.value
                      })}
                      placeholder="Nhập mô tả danh mục..."
                      className="lm-form-input lm-form-textarea"
                    />
                  </div>
                  
                  <div className="lm-form-group">
                    <label>URL hình ảnh:</label>
                    <input
                      type="url"
                      value={categoryForm.category_imageurl}
                      onChange={(e) => setCategoryForm({
                        ...categoryForm,
                        category_imageurl: e.target.value
                      })}
                      placeholder="https://example.com/image.jpg"
                      className="lm-form-input"
                    />
                  </div>
                  
                  <div className="lm-form-group">
                    <label>Chủ đề:</label>
                    <select
                      value={categoryForm.topic_id}
                      onChange={(e) => setCategoryForm({
                        ...categoryForm,
                        topic_id: e.target.value
                      })}
                      className="lm-form-select"
                    >
                      <option value="">Chọn chủ đề</option>
                      {topics.map(topic => (
                        <option key={topic._id} value={topic._id}>
                          {topic.topic_title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleCreateCategory}
                    disabled={formLoading || !categoryForm.category_content.trim()}
                    className="lm-btn lm-btn-primary"
                  >
                    {formLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus"></i>
                        Thêm danh mục
                      </>
                    )}
                  </button>
                </div>

                {/* Categories List */}
                <div className="lm-items-list">
                  <h4>Danh sách danh mục ({categories.length})</h4>
                  {categories.length === 0 ? (
                    <div className="lm-empty-list">
                      <i className="fas fa-tags"></i>
                      <p>Chưa có danh mục nào</p>
                    </div>
                  ) : (
                    <div className="lm-items-grid">
                      {categories.map(category => {
                        const contentCount = contents.filter(c => c.category_id?._id === category._id).length;
                        
                        return (
                          <div key={category._id} className="lm-item-card">
                            <div className="lm-item-image">
                              <img
                                src={category.category_imageurl || '/default-category.png'}
                                alt={category.category_content}
                                onError={(e) => {
                                  e.target.src = '/default-category.png';
                                }}
                              />
                            </div>
                            
                            <div className="lm-item-info">
                              <h5>{category.category_content}</h5>
                              <p>{category.category_description || 'Chưa có mô tả'}</p>
                              <small>ID: {category._id}</small>
                            </div>
                            
                            <div className="lm-item-meta">
                              <span className="lm-item-count">{contentCount} nội dung</span>
                            </div>
                            
                            <div className="lm-item-actions">
                              <button
                                onClick={() => handleDeleteCategory(category._id)}
                                className="lm-btn lm-btn-icon lm-btn-delete"
                                title="Xóa danh mục"
                                disabled={contentCount > 0}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                            
                            {contentCount > 0 && (
                              <div className="lm-item-warning">
                                <i className="fas fa-info-circle"></i>
                                Không thể xóa do còn {contentCount} nội dung
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lm-modal-footer">
                <button 
                  onClick={() => setShowCategoryModal(false)}
                  className="lm-btn lm-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Content Modal */}
        {showCreateContentModal && (
          <div className="lm-modal-overlay" onClick={() => setShowCreateContentModal(false)}>
            <div className="lm-modal lm-form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lm-modal-header">
                <h3>
                  <i className="fas fa-plus"></i>
                  Thêm nội dung mới
                </h3>
                <button 
                  onClick={() => setShowCreateContentModal(false)}
                  className="lm-modal-close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="lm-modal-body">
                <form className="lm-create-form">
                  <div className="lm-form-group lm-form-full">
                    <label>Tiêu đề:</label>
                    <input
                      type="text"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({
                        ...contentForm,
                        title: e.target.value
                      })}
                      placeholder="Nhập tiêu đề nội dung..."
                      className="lm-form-input"
                      required
                    />
                  </div>
                  
                  <div className="lm-form-row">
                    <div className="lm-form-group">
                      <label>Chủ đề:</label>
                      <select
                        value={contentForm.topic_id}
                        onChange={(e) => setContentForm({
                          ...contentForm,
                          topic_id: e.target.value
                        })}
                        className="lm-form-select"
                        required
                      >
                        <option value="">Chọn chủ đề</option>
                        {topics.map(topic => (
                          <option key={topic._id} value={topic._id}>
                            {topic.topic_title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="lm-form-group">
                      <label>Danh mục:</label>
                      <select
                        value={contentForm.category_id}
                        onChange={(e) => setContentForm({
                          ...contentForm,
                          category_id: e.target.value
                        })}
                        className="lm-form-select"
                        required
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.category_content}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="lm-form-group lm-form-full">
                    <label>URL hình ảnh:</label>
                    <input
                      type="url"
                      value={contentForm.image_urls[0]}
                      onChange={(e) => setContentForm({
                        ...contentForm,
                        image_urls: [e.target.value]
                      })}
                      placeholder="https://example.com/image.jpg"
                      className="lm-form-input"
                    />
                    {contentForm.image_urls[0] && (
                      <div className="lm-image-preview">
                        <img
                          src={contentForm.image_urls[0]}
                          alt="Preview"
                          className="lm-preview-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="lm-form-group lm-form-full">
                    <label>Nội dung:</label>
                    <textarea
                      value={contentForm.content}
                      onChange={(e) => setContentForm({
                        ...contentForm,
                        content: e.target.value
                      })}
                      placeholder="Nhập nội dung bài viết..."
                      className="lm-form-input lm-form-textarea"
                      rows="10"
                      required
                    />
                  </div>
                </form>
              </div>
              
              <div className="lm-modal-footer">
                <button
                  onClick={handleCreateContent}
                  disabled={formLoading || !contentForm.title.trim() || !contentForm.content.trim()}
                  className="lm-btn lm-btn-primary"
                >
                  {formLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Tạo nội dung
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowCreateContentModal(false)}
                  className="lm-btn lm-btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Hủy
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

export default LibraryManagement;