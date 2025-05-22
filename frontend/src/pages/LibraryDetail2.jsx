import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SellProduct from "../components/SellProduct";
import { bestsellingProducts } from "../data/productData";
import "../css/LibraryDetail2.css";

const LibraryDetail2 = () => {
  const { categoryId } = useParams();
  const [mainImage, setMainImage] = useState("/Gecko1.png");

  // Data for reptile articles (menu bên trái)
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

  // Data for related articles
  const relatedArticles = [
    {
      id: 1,
      title: "Loài bò sát có vỏ đa dạng hoạt tiết",
      description: "Khám phá thế giới đa dạng của các loài bò sát có vỏ với nhiều hoạt tiết tuyệt đẹp, từ rùa cạn đến rùa biển, rùa vàng và nhiều loài rùa khác...",
      imageUrl: "/api/placeholder/250/150"
    },
    {
      id: 2,
      title: "Loài bò sát có vỏ đa dạng hoạt tiết",
      description: "Các loài rùa với những đặc tính khác nhau và môi trường sống đa dạng. Tìm hiểu về chế độ ăn, sinh sản và cách chăm sóc rùa đúng cách...",
      imageUrl: "/api/placeholder/250/150"
    },
    {
      id: 3, 
      title: "Loài bò sát không vỏ đặc sắc",
      description: "Tìm hiểu về các loài bò sát không vỏ như rắn, thằn lằn, tắc kè và kỳ đà. Khám phá đặc điểm sinh học, tập tính và nhu cầu của chúng...",
      imageUrl: "/api/placeholder/250/150"
    },
    {
      id: 4,
      title: "Loài bò sát có vỏ đa dạng hoạt tiết",
      description: "Phân loại giữa các loài rùa nước ngọt, rùa cạn và cách nhận biết. Tìm hiểu về sức khỏe và dinh dưỡng của loài bò sát có vỏ và các bệnh thường gặp...",
      imageUrl: "/api/placeholder/250/150"
    }
  ];

  // Thumbnail images data
  const thumbnailImages = [
    "/Gecko1.png",
    "/Gecko2.png",
    "/Gecko3.png"
  ];

  const handleThumbnailClick = (imageUrl) => {
    setMainImage(imageUrl);
  };

  return (
    <div className="gecko-detail-page">
      <Header />
      
      {/* Page Title Banner */}
      <div className="page-title-banner">
        <h1>THƯ VIỆN KIẾN THỨC</h1>
      </div>
      
      {/* Container */}
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/">Trang chủ</a> &gt; <a href="/thu-vien">Thư viện kiến thức</a> &gt; <a href="/bo-sat-viet-nam">Bò sát phổ biến ở Việt Nam</a> &gt; <span>Thằn lằn da báo</span>
        </div>
        
        <div className="content-wrapper">
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
            
            {/* Sử dụng component SellProduct */}
            <SellProduct products={bestsellingProducts} />
          </div>
          
          {/* Main Content */}
          <div className="main-content">
            <h1 className="article-title">Thằn lằn Da Báo Leopard Gecko</h1>
            <div className="article-meta">
              <span>Đăng bởi: admin</span> | <span>Cập nhật: 15/05/2023</span> | <span>Lượt xem: 2,435</span>
            </div>
            
            <div className="article-content">
              <div className="article-gallery">
                <div className="main-image">
                  <img src={mainImage} alt="Thằn lằn Da Báo vàng" />
                </div>
                <div className="thumbnail-images">
                  {thumbnailImages.map((imageUrl, index) => (
                    <img 
                      key={index}
                      src={imageUrl} 
                      alt={`Thằn lằn Da Báo ${index + 1}`}
                      onClick={() => handleThumbnailClick(imageUrl)}
                      style={{ 
                        cursor: 'pointer',
                        border: mainImage === imageUrl ? '2px solid #007bff' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <p className="article-description">
                Thằn lằn da báo (Leopard Gecko) là loài bò sát nhỏ thuộc họ Eublepharidae, sống chủ yếu ở vùng Trung Đông và Nam Á. Chúng là loài thú cưng phổ biến do dễ chăm sóc, tính cách hiền lành và đa dạng về màu sắc.
              </p>
              
              <div className="article-info-box">
                <h3>Thông tin cơ bản:</h3>
                <ul>
                  <li><strong>Tên khoa học:</strong> Eublepharis macularius</li>
                  <li><strong>Họ:</strong> Eublepharidae</li>
                  <li><strong>Kích thước:</strong> 20-25cm</li>
                  <li><strong>Tuổi thọ:</strong> 10-20 năm</li>
                  <li><strong>Sinh sản:</strong> Đẻ trứng</li>
                  <li><strong>Chế độ ăn:</strong> Côn trùng (dế, gián, sâu...)</li>
                </ul>
              </div>
              
              <p>
                Thằn lằn da báo có nhiều biến thể màu sắc khác nhau như: Normal, Albino, Tangerine, Blizzard, Giant... Chúng là loài dễ nuôi, phù hợp với người mới bắt đầu nuôi bò sát. Nhiệt độ chuồng nuôi tối ưu từ 25-32°C với khu vực ấm và khu vực mát.
              </p>
              
              <h2>Nên mua ở đâu chúng?</h2>
              <p>
                Bạn có thể mua Thằn lằn da báo tại các cửa hàng thú cưng uy tín, hoặc từ những người nuôi có kinh nghiệm. Tại Việt Nam, giá của một con Thằn lằn da báo thường dao động từ 500.000đ đến vài triệu đồng tùy theo loại và độ hiếm.
              </p>
              <p>
                Khi mua, cần chú ý lựa chọn những con khỏe mạnh, có mắt sáng, không có dấu hiệu bệnh tật. Thằn lằn da báo khỏe mạnh thường có đuôi mập, da sáng bóng và hoạt động linh hoạt.
              </p>
              <p>
                Nếu bạn mới bắt đầu nuôi, nên chọn những con đã được thuần hóa tốt, quen với việc tiếp xúc với con người. Điều này giúp bạn dễ dàng chăm sóc và tạo mối quan hệ tốt với thú cưng của mình.
              </p>
            </div>
            
            <div className="article-comment-section">
              <h3>Để lại bình luận</h3>
              <div className="comment-form">
                <div className="form-group">
                  <textarea className="form-control" rows="4" placeholder="Nội dung bình luận..."></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <input type="text" className="form-control" placeholder="Họ tên" />
                  </div>
                  <div className="form-group half">
                    <input type="email" className="form-control" placeholder="Email" />
                  </div>
                </div>
                <button className="btn btn-primary">ĐĂNG BÌNH LUẬN</button>
              </div>
            </div>
            
            <div className="related-articles">
              <h2>Bài viết cùng chuyên mục</h2>
              <div className="article-cards">
                {relatedArticles.map(article => (
                  <div key={article.id} className="related-article-card">
                    <div className="card-image">
                      <img src={article.imageUrl} alt={article.title} />
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{article.title}</h3>
                      <p className="card-description">{article.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LibraryDetail2;