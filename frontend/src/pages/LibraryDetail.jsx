import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useLocation } from "react-router-dom";

const LibraryDetail = () => {
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const categoryId = queryParams.get("category");

  useEffect(() => {
    setLoadingList(true);
    let url = "http://localhost:8080/reptitist/library_contents";
    axios
      .get(url)
      .then((res) => {
        let data = res.data;
        if (categoryId) {
          data = data.filter(
            (item) =>
              item.category_content_id &&
              item.category_content_id._id === categoryId
          );
        }
        setContents(data);
        setLoadingList(false);
      })
      .catch(() => {
        setError("Lỗi khi tải danh sách nội dung.");
        setLoadingList(false);
      });
  }, [categoryId]);

  const handleContentClick = (id) => {
    setLoadingDetail(true);
    axios
      .get(`http://localhost:8080/reptitist/library_contents/${id}`)
      .then((res) => {
        setSelectedContent(res.data);
        setLoadingDetail(false);
      })
      .catch(() => {
        setError("Lỗi khi tải chi tiết nội dung.");
        setLoadingDetail(false);
      });
  };

  return (
    <>
      <Header />
      <div
        className="container my-4"
        style={{ display: "flex", gap: "2rem", minHeight: "600px" }}
      >
        {/* Danh sách nội dung */}
        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            overflowY: "auto",
            maxHeight: "600px",
          }}
        >
          <h2>Danh sách nội dung thư viện</h2>
          {loadingList ? (
            <p>Đang tải danh sách...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : contents.length === 0 ? (
            <p>Không có nội dung nào.</p>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {contents.map((content) => (
                <li
                  key={content._id}
                  onClick={() => handleContentClick(content._id)}
                  style={{
                    cursor: "pointer",
                    marginBottom: "10px",
                    padding: "8px",
                    borderRadius: "4px",
                    backgroundColor:
                      selectedContent && selectedContent._id === content._id
                        ? "#e0f7fa"
                        : "transparent",
                  }}
                >
                  {content.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chi tiết nội dung */}
        <div
          style={{
            flex: 2,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            overflowY: "auto",
            maxHeight: "600px",
          }}
        >
          <h2>Chi tiết nội dung</h2>
          {loadingDetail ? (
            <p>Đang tải chi tiết...</p>
          ) : selectedContent ? (
            <div>
              <h3>{selectedContent.title}</h3>
              {selectedContent.image_urls &&
                selectedContent.image_urls.length > 0 &&
                selectedContent.image_urls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Ảnh ${idx + 1}`}
                    style={{
                      maxWidth: "100%",
                      marginBottom: "15px",
                      borderRadius: "4px",
                    }}
                  />
                ))}
              <div
                dangerouslySetInnerHTML={{ __html: selectedContent.content }}
              />
            </div>
          ) : (
            <p>Vui lòng chọn nội dung để xem chi tiết.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LibraryDetail;
