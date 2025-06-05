import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

const LibraryContent = () => {
  const { categoryId } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8080/reptitist/library_contents")
      .then((response) => {
        // Lọc theo category_id._id (đã được populate)
console.log("API data:", response.data);
        const filtered = response.data.filter(
  (item) => item.category_content_id === categoryId
);


        setContents(filtered);
        setLoading(false);
      })
      .catch((err) => {
        setError("Lỗi khi tải nội dung thư viện");
        setLoading(false);
      });
  }, [categoryId]);

  if (loading) return <div>Đang tải nội dung...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Header />
      <div className="page-title">
        <div className="container">
          <h1>Nội dung thư viện</h1>
          {/* <p>
  Danh mục:{" "}
  {contents.length > 0
    ? contents[0].category_content_id // chỉ có ID, nên hiện tại chưa hiển thị được tên danh mục
    : "Không tìm thấy danh mục"}
</p> */}

        </div>
      </div>

      <div className="container my-4">
        {contents.length === 0 ? (
          <p>Chưa có nội dung nào trong danh mục này.</p>
        ) : (
          contents.map((item) => (
            <div key={item._id} className="mb-4 p-3 border rounded">
              <h3>{item.title}</h3>
              
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
              {item.image_urls &&
                item.image_urls.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`image-${index}`}
                    style={{ maxWidth: "50%", height: "auto", marginTop: "10px" }}
                  />
                ))}
            </div>
          ))
        )}
      </div>
      <Footer />
    </>
  );
};

export default LibraryContent;
