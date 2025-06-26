import {
  Download,
  Play,
  Info,
  FilePlus2,
  FileText,
  TextSearch,
} from "lucide-react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import "../css/UserManual.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ReactPlayer from "react-player";

function UserManual() {
  const downloadItems = [
    {
      icon: Info,
      title: "Hướng dẫn sử dụng tổng quan",
      subtitle: "286 Lượt",
      filename: "manual-overview.pdf",
      fileId: "1DKUH3jm4owACMliimOV58ljiBd4FPmkY",
    },
    {
      icon: FilePlus2,
      title: "Hướng dẫn sử dụng - người dùng",
      subtitle: "46 Tài khoản",
      filename: "manual-user.pdf",
      fileId: "1kam2IyuYGS-hI1cCwecoZqBIfqoWxfwN",
    },
    {
      icon: FileText,
      title: "Hướng dẫn sử dụng - đối tác",
      subtitle: "1.000 + bài",
      filename: "manual-partner.pdf",
      fileId: "1DLdvzzJnkJ_1DXPQk-6u0_ZO_MP6aaCm",
    },
    {
      icon: TextSearch,
      title: "Hướng dẫn sử dụng ReptiAI",
      subtitle: "26 Tài khoản",
      filename: "manual-repti-ai.pdf",
      fileId: "1lFss44m7Yb1vi2UwV1iQdD--sSgZwgNh",
    },
  ];

  const handleDownload = (fileId) => {
    // Mở link tải Google Drive
    window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, "_blank");
  };

  return (
    <>
      <Header />
      <div className="user-manual-container">
        <Container maxWidth="xl">
          <Row>
            {/* Video Section */}
            <Col lg={8}>
              <div className="user-manual-video-section">
                {/* Video Placeholder */}
                <div className="user-manual-video-placeholder" style={{width: "100%", height: "100%"}}>
                  
                  <ReactPlayer
                    url="https://youtu.be/sHLGtyzCP9c"
                    autoplay={true}
                    
                    loop={true}
                    className="user-manual-video-image"
                    width="100%"
                    height="100%"
                  />

                  <div className="user-manual-video-label">Video hướng dẫn</div>
                </div>

                {/* Content */}
                <div className="user-manual-content-section">
                  <h2 className="user-manual-title">
                    Hướng dẫn sử dụng Website Reptisist cho người dùng mới
                  </h2>
                  <p className="user-manual-description">
                    Video hướng dẫn sử dụng website chăm sóc bò sát – giúp người
                    nuôi dễ dàng tạo không gian sống lý tưởng cho thú cưng.
                    Trang web hỗ trợ thiết kế môi trường gần giống tự nhiên, bao
                    gồm việc lựa chọn vật liệu trú ẩn như hang đá, vỏ cây, thiết
                    lập nhiệt độ – độ ẩm – ánh sáng UVB phù hợp với từng loài.
                  </p>
                </div>
              </div>
            </Col>
            {/* Download Files Section */}
            <Col lg={4}>
              <div className="user-manual-download-section">
                <h3 className="user-manual-download-title">Tài liệu tải về</h3>
                {downloadItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Card key={index} className="user-manual-download-card">
                      <Card.Body className="user-manual-card-body">
                        <div className="user-manual-card-content">
                          <div className="user-manual-card-left">
                            <div className="user-manual-icon-container">
                              <IconComponent className="user-manual-card-icon" />
                            </div>
                            <div className="user-manual-card-text-container">
                              <h4 className="user-manual-card-title">
                                {item.title}
                              </h4>
                              <p className="user-manual-card-subtitle">
                                {item.filename}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="link"
                            className="user-manual-download-button"
                            onClick={() => handleDownload(item.fileId)}
                          >
                            <Download className="user-manual-download-icon" />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
                {/* <a
                  href={`https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Tải về PDF
                </a> */}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default UserManual;
