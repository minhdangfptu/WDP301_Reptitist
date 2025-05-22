import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sellerproduct from "../components/SellProduct";
import { bestsellingProducts } from "../data/productData";
import "../css/LibraryDetail.css";

const LibraryDetail = () => {
  const navigate = useNavigate();

  // Data for reptile categories
  const reptileCategories = [
    {
      id: 1,
      title: "Loài bò sát có vỏ đa dạng hoạt tiết",
      description: "Khám phá thế giới đa dạng của các loài bò sát có vỏ với nhiều hoạt tiết tuyệt đẹp, từ rùa cạn đến rùa biển, rùa vàng và nhiều loài rùa khác. Tìm hiểu về đặc tính và môi trường sống.",
      imageUrl: "/api/placeholder/250/150"
    },
    {
      id: 2,
      title: "Loài bò sát có vỏ đa dạng hoạt tiết",
      description: "Các loài rùa với những đặc tính khác nhau và môi trường sống đa dạng. Tìm hiểu về chế độ ăn, sinh sản và cách chăm sóc rùa đúng cách trong môi trường nuôi nhốt.",
      imageUrl: "/api/placeholder/250/150"
    },
    {
      id: 3, 
      title: "Loài bò sát không vỏ đặc sắc",
      description: "Tìm hiểu về các loài bò sát không vỏ như rắn, thằn lằn, tắc kè và kỳ đà. Khám phá đặc điểm sinh học, tập tính và nhu cầu của chúng để xây dựng môi trường sống phù hợp.",
      imageUrl: "/api/placeholder/250/150"
    },
    {
      id: 4,
      title: "Loài bò sát có vỏ đa dạng hoạt tiết",
      description: "Phân loại giữa các loài rùa nước ngọt, rùa cạn và cách nhận biết. Tìm hiểu về sức khỏe và dinh dưỡng của loài bò sát có vỏ và các bệnh thường gặp trong quá trình nuôi.",
      imageUrl: "/api/placeholder/250/150"
    }
  ];

  // Data for reptile articles
  const reptileArticles = [
    { id: 1, name: "Bóng Nam Phi (Iguanas)", count: 46 },
    { id: 2, name: "Bóng Úc Úc", count: 49 },
    { id: 3, name: "Kỳ đà cảnh", count: 50 },
    { id: 4, name: "Thằn lằn mắt lồi", count: 45 },
    { id: 5, name: "Thằn lằn bò sừng", count: 48 },
    { id: 6, name: "Trăn Gấm", count: 45 },
    { id: 7, name: "Mèo cánh", count: 45 },
    { id: 8, name: "Rùa sulcata", count: 45 },
    { id: 9, name: "Cá sấu cảnh", count: 45 },
    { id: 10, name: "Các loài bò sát khác", count: null }
  ];

  const handleCardClick = (categoryId) => {
    navigate(`/LibraryDetail2/${categoryId}`);
  };

  return (
    <div className="library-page">
      <Header />
      
      {/* Page Title Banner */}
      <div className="page-title-banner">
        <h1>THƯ VIỆN KIẾN THỨC</h1>
      </div>
      
      {/* Breadcrumb */}
      <div className="container">
        <div className="breadcrumb">
          <a href="/">Trang chủ</a> &gt; <a href="/thu-vien">Thư viện kiến thức</a> &gt; <span>Bò sát phổ biến ở Việt Nam</span>
        </div>
        
        <div className="library-content">
          {/* Sidebar */}
          <div className="sidebar">
            <h3 className="sidebar-title">Chuyên mục bài viết</h3>
            <ul className="article-list">
              {reptileArticles.map(article => (
                <li key={article.id}>
                  <a href={`#${article.id}`}>
                    {article.name} {article.count && <span className="count">({article.count})</span>}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Sử dụng component Sellerproduct */}
            <Sellerproduct products={bestsellingProducts} />
          </div>
          
          {/* Main Content */}
          <div className="main-content">
            <div className="reptile-categories">
              {reptileCategories.map(category => (
                <div 
                  key={category.id} 
                  className="category-card"
                  onClick={() => handleCardClick(category.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-image">
                    <img src={category.imageUrl} alt={category.title} />
                  </div>
                  <div className="category-content">
                    <h3 className="category-title">{category.title}</h3>
                    <p className="category-description">{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LibraryDetail;