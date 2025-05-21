import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/LibraryDetail.css";

const LibraryDetail = () => {
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

  // Data for bestselling products
  const bestsellingProducts = [
    {
      id: 1,
      name: "Thức ăn hỗn hợp dành cho bò sát Repti 7 65g Power Deluxe 1",
      price: "180.000đ",
      imageUrl: "/public/product1.png"
    },
    {
      id: 2,
      name: "Thức ăn hỗn hợp cho bò sát Repti 7 65g cho bóng Nam Mỹ 65g Vitamin Power Deluxe 2",
      price: "180.000đ",
      imageUrl: "/public/product1.png"
    },
    {
      id: 3,
      name: "Thức ăn hỗn hợp cho bò sát Repti 7 65g Nam Mỹ Vitamin Power Deluxe 3",
      price: "180.000đ",
      imageUrl: "/public/product1.png"
    },
    {
      id: 4,
      name: "Thức ăn hỗn hợp cho bò sát Repti 7 65g Nam Mỹ Vitamin Power Deluxe 4",
      price: "180.000đ",
      imageUrl: "/public/product1.png"
    }
  ];

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
          <a href="/LandingPage">Trang chủ</a> &gt; <a href="/Library">Thư viện kiến thức</a> &gt; <span>Bò sát phổ biến ở Việt Nam</span>
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
            
            <div className="bestselling">
              <h3 className="sidebar-title">Sản phẩm bán chạy</h3>
              <ul className="product-list">
                {bestsellingProducts.map(product => (
                  <li key={product.id} className="product-item">
                    <div className="product-image">
                      <img src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="product-info">
                      <a href={`#product-${product.id}`} className="product-name">{product.name}</a>
                      <span className="product-price">{product.price}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="main-content">
            <div className="reptile-categories">
              {reptileCategories.map(category => (
                <div key={category.id} className="category-card">
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