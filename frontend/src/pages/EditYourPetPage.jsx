import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { baseUrl } from "../config";

const REPTILE_SPECIES = [
  "Rùa cạn",
  "Rùa nước",
  "Rắn cảnh",
  "Thằn lằn",
  "Kỳ nhông",
  "Tắc kè",
  "Kỳ đà",
  "Rồng Úc",
  "Rồng Nam Mỹ (Iguana)",
  "Rắn sữa (Milk Snake)",
  "Rắn ngô (Corn Snake)",
  "Rắn vua (King Snake)",
  "Tắc kè báo (Leopard Gecko)",
  "Thằn lằn bóng (Blue-tongue Skink)",
  "Tắc kè đuôi béo (Fat-tailed Gecko)",
  "Tắc kè Tokay",
  "Rùa tai đỏ",
  "Rùa vàng",
  "Rùa hộp",
  "Rắn mamba",
  "Rắn lục",
  "Rắn hổ mang",
  "Rắn hổ trâu",
  "Kỳ tôm (Axolotl - lưỡng cư)",
  "Khác"
];

const EditYourPetPage = () => {
  const { reptileId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [petData, setPetData] = useState({
    reptile_name: "",
    reptile_species: "",
    name: "",
    description: "",
    user_reptile_imageurl: "",
    age: "",
    current_weight: "",
  });
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherSpecies, setOtherSpecies] = useState("");

  // Lấy thông tin thú cưng hiện tại
  useEffect(() => {
    axios
      .get(`${baseUrl}/reptitist/pet/${reptileId}`)
      .then((res) => {
        const data = res.data;
        setPetData({
          reptile_name: data.reptile_name || "",
          reptile_species: REPTILE_SPECIES.includes(data.reptile_species) ? data.reptile_species : "",
          name: data.name || "",
          description: data.description || "",
          user_reptile_imageurl: data.user_reptile_imageurl || "",
          age: data.age || "",
          current_weight: data.current_weight || "",
        });
        setOtherSpecies(REPTILE_SPECIES.includes(data.reptile_species) ? "" : data.reptile_species || "");
        setPreviewImage(data.user_reptile_imageurl || "");
      })
      .catch(() => {
        toast.error("Không thể tải dữ liệu thú cưng.");
      });
  }, [reptileId]);

  // Helper: file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Validate image file
  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, GIF, WebP)' };
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'Kích thước ảnh không được vượt quá 5MB' };
    }
    return { isValid: true };
  };

  // Xử lý upload ảnh
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    try {
      const base64Data = await fileToBase64(file);
      setPetData(prev => ({
        ...prev,
        user_reptile_imageurl: base64Data
      }));
      setPreviewImage(base64Data);
      toast.success('Ảnh đã được tải lên thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải lên ảnh');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`${baseUrl}/reptitist/pet/update-reptile/${reptileId}`, {
        ...petData,
        reptile_species: petData.reptile_species === "" ? otherSpecies : petData.reptile_species,
      });
      toast.success("Cập nhật thành công!");
      setTimeout(() => {
        navigate(-1); // Quay lại trang trước
      }, 1500);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Container style={{ paddingTop: "20px", maxWidth: 1100, paddingBottom: "20px" }}>
        <h2 className="fw-bold mb-4 text-center">Chỉnh sửa thông tin thú cưng</h2>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeButton />
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Cột 1: Ảnh */}
                <Col md={4} className="mb-4 mb-md-0 d-flex flex-column align-items-center justify-content-start">
                  <div className="w-100 text-center mb-3">
                    <img
                      src={previewImage || "/default-pet-image.jpg"}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxWidth: '220px',
                        maxHeight: '220px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '1px solid #eee',
                        background: '#fafafa'
                      }}
                    />
                  </div>
                  <Form.Group controlId="user_reptile_imageurl" className="w-100">
                    <Form.Label className="fw-medium">Cập nhật hình ảnh</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                    />
                    <Form.Text className="text-muted">
                      Hỗ trợ: JPG, PNG, GIF, WebP. Tối đa 5MB.
                    </Form.Text>
                  </Form.Group>
                </Col>
                {/* Cột 2: Thông tin 1 */}
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="reptile_name">
                    <Form.Label className="fw-medium">Tên thú cưng <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="reptile_name"
                      value={petData.reptile_name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label className="fw-medium">Biệt danh</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={petData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="reptile_species">
                    <Form.Label className="fw-medium">Loài <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="reptile_species"
                      value={petData.reptile_species || (otherSpecies ? "Khác" : "")}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "Khác") {
                          setPetData(prev => ({ ...prev, reptile_species: "" }));
                        } else {
                          setPetData(prev => ({ ...prev, reptile_species: value }));
                          setOtherSpecies("");
                        }
                      }}
                      required
                    >
                      <option value="">-- Chọn loài bò sát --</option>
                      {REPTILE_SPECIES.map((species, idx) => (
                        <option key={idx} value={species}>{species}</option>
                      ))}
                    </Form.Select>
                    {(petData.reptile_species === "" && (otherSpecies !== "" || (petData.reptile_species === "" && otherSpecies === ""))) && (
                      <Form.Control
                        className="mt-2"
                        type="text"
                        placeholder="Nhập loài bò sát khác"
                        value={otherSpecies}
                        onChange={(e) => setOtherSpecies(e.target.value)}
                        required
                      />
                    )}
                  </Form.Group>
                </Col>
                {/* Cột 3: Thông tin 2 */}
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="description">
                    <Form.Label className="fw-medium">Mô tả</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={petData.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="age">
                    <Form.Label className="fw-medium">Tuổi (tháng)</Form.Label>
                    <Form.Control
                      type="number"
                      name="age"
                      value={petData.age}
                      onChange={handleChange}
                      min={0}
                      placeholder="Nhập tuổi theo tháng"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="current_weight">
                    <Form.Label className="fw-medium">Cân nặng hiện tại (kilogram) </Form.Label>
                    <Form.Control
                      type="number"
                      name="current_weight"
                      value={petData.current_weight}
                      onChange={handleChange}
                      min={0}
                      placeholder="Nhập tuổi theo Kilogram"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-center mt-4">
                <Button variant="success" type="submit" size="lg" className="px-5" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default EditYourPetPage;