import React from "react";

const Sellerproduct = ({ products }) => {
  // Nếu không có products được truyền vào, sử dụng dữ liệu mặc định
  const defaultProducts = [
    {
      id: 1,
      name: "Thức ăn hỗn hợp dành cho bò sát Repti 7 65g Power Deluxe 1",
      price: "180.000đ",
      imageUrl: "/images/product1.png"
    },
    {
      id: 2,
      name: "Thức ăn hỗn hợp cho bò sát Repti 7 65g cho bóng Nam Mỹ 65g Vitamin Power Deluxe 2",
      price: "180.000đ",
      imageUrl: "/images/product1.png"
    },
    {
      id: 3,
      name: "Thức ăn hỗn hợp cho bò sát Repti 7 65g Nam Mỹ Vitamin Power Deluxe 3",
      price: "180.000đ",
      imageUrl: "/images/product1.png"
    },
    {
      id: 4,
      name: "Thức ăn hỗn hợp cho bò sát Repti 7 65g Nam Mỹ Vitamin Power Deluxe 4",
      price: "180.000đ",
      imageUrl: "/images/product1.png"
    }
  ];

  // Sử dụng products từ props hoặc defaultProducts nếu không có
  const displayProducts = products || defaultProducts;

  const thumbnailImages = [
    "/images/Gecko1.png",
    "/images/Gecko2.png",
    "/images/Gecko3.png"
  ];

  return (
    <div className="bestselling">
      <h3 className="sidebar-title">Sản phẩm bán chạy</h3>
      <ul className="product-list">
        {displayProducts.map(product => (
          <li key={product.id} className="product-item">
            <div className="product-image">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
                }}
              />
            </div>
            <div className="product-info">
              <a href={`/product/${product.id}`} className="product-name">{product.name}</a>
              <span className="product-price">{product.price}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sellerproduct;