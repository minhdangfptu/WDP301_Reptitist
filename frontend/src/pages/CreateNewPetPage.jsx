import { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Card, Row, Col, InputGroup, } from "react-bootstrap";
import { useNavigate } from "react-router-dom";  
import { useAuth } from "../context/AuthContext";  
import { ToastContainer, toast } from 'react-toastify'; 
import Header from "../components/Header";
import Footer from "../components/Footer";

const CreateNewPet = () => {
  const { user } = useAuth();
  const user_id = user ? user.id : null;
  const [petData, setPetData] = useState({
    user_id: user_id,
    reptile_name: "",
    reptile_species: "",
    name: "",
    description: "",
    user_reptile_imageurl: "",
    age: "",
    follow_since: "",
    current_weight: "",
    weight_history: [],
    sleeping_status: [],
    sleeping_history: [],
    treatment_history: [],
    nutrition_history: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState({ success: false, message: "" });
  const navigate = useNavigate();  // Khởi tạo useNavigate từ React Router

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("http://localhost:8080/reptitist/pet/", petData);
      console.log("Pet created successfully", response.data);
      setSubmitResult({
        success: true,
        message: "Thú cưng đã được tạo thành công!",
      });
      toast.success("Thú cưng đã được tạo thành công!"); 
      setTimeout(() => {
        navigate("/YourPet"); 
      }, 2000);

      // Reset form data
      setPetData({
        user_id: user_id,
        reptile_name: "",
        reptile_species: "",
        name: "",
        description: "",
        user_reptile_imageurl: "",
        age: "",
        follow_since: "",
        current_weight: "",
        weight_history: [],
        sleeping_status: [],
        sleeping_history: [],
        treatment_history: [],
        nutrition_history: [],
      });
    } catch (error) {
      console.error("Error creating pet", error);
      setSubmitResult({
        success: false,
        message: "Có lỗi xảy ra khi tạo thú cưng. Vui lòng thử lại.",
      });
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");  // Hiển thị thông báo lỗi
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Header />
    <Container style={{paddingTop: "30px"}}>
      <div className="text-center mb-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2  className="fw-bold text-success">Tạo Hồ Sơ Thú Cưng Mới</h2>
        <p className="text-muted">Điền thông tin chi tiết về thú cưng bò sát của bạn</p>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeButton />

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Card className="bg-light border-0 mb-4">
                  <Card.Body>
                    <h5 className="mb-3 text-success">Thông tin cơ bản</h5>

                    <Form.Group className="mb-3" controlId="reptile_name">
                      <Form.Label className="fw-medium">
                        Tên thú cưng <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-tag"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Nhập tên thú cưng"
                          name="reptile_name"
                          value={petData.reptile_name}
                          onChange={handleChange}
                          required
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="name">
                      <Form.Label className="fw-medium">Biệt danh</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-person-badge"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Nhập biệt danh"
                          name="name"
                          value={petData.name}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reptile_species">
                      <Form.Label className="fw-medium">
                        Loài <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-diagram-3"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Nhập loài bò sát"
                          name="reptile_species"
                          value={petData.reptile_species}
                          onChange={handleChange}
                          required
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="description">
                      <Form.Label className="fw-medium">Mô tả</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-card-text"></i>
                        </InputGroup.Text>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Mô tả về thú cưng của bạn"
                          name="description"
                          value={petData.description}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="bg-light border-0 mb-4">
                  <Card.Body>
                    <h5 className="mb-3 text-success">Thông tin chi tiết</h5>

                    <Form.Group className="mb-3" controlId="user_reptile_imageurl">
                      <Form.Label className="fw-medium">Hình ảnh</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-image"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Nhập URL hình ảnh"
                          name="user_reptile_imageurl"
                          value={petData.user_reptile_imageurl}
                          onChange={handleChange}
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Nhập URL hình ảnh hoặc để trống để sử dụng hình ảnh mặc định
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="age">
                      <Form.Label className="fw-medium">
                        Tuổi <span className="text-danger">*</span>
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-calendar-event"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          placeholder="Nhập tuổi"
                          name="age"
                          value={petData.age}
                          onChange={handleChange}
                          required
                        />
                        <InputGroup.Text className="bg-white">năm</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="follow_since">
                      <Form.Label className="fw-medium">Theo dõi từ</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-calendar-check"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="date"
                          placeholder="Ngày bắt đầu theo dõi"
                          name="follow_since"
                          value={petData.follow_since}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="current_weight">
                      <Form.Label className="fw-medium">Cân nặng hiện tại</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <i className="bi bi-speedometer"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          placeholder="Nhập cân nặng"
                          name="current_weight"
                          value={petData.current_weight}
                          onChange={handleChange}
                        />
                        <InputGroup.Text className="bg-white">gram</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-center mt-4">
              <Button variant="success" type="submit" size="lg" className="px-5" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Tạo thú cưng
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <div className="text-center mt-4">
        <p className="text-muted small">
          <i className="bi bi-info-circle me-1"></i>
          Các trường có dấu <span className="text-danger">*</span> là bắt buộc
        </p>
      </div>
    </Container>
    <Footer/>
    </>
  );
};

export default CreateNewPet;
