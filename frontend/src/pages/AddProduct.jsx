import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { baseUrl } from "../config"
import { Form, Button, Alert, Card, Container, Row, Col } from "react-bootstrap"
import { Package, DollarSign, Hash, Tag, ImageIcon, Plus, X } from "lucide-react"

const SENSITIVE_WORDS = [
  "sex", "xxx", "fuck", "shit", "bậy", "lừa đảo", "scam", "địt", "đụ", "cặc", "dcm", "dm", "đm", "ngu", "đồ ngu"
  
];

const containsSensitiveWords = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SENSITIVE_WORDS.some(word => lower.includes(word));
};

const AddProduct = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    product_name: "",
    product_price: "",
    product_description: "",
    product_quantity: "",
    product_imageurl: [""],
    product_category_id: "",
  })

  const [error, setError] = useState("")
  const [categories, setCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseUrl}/reptitist/shop/category`)
        setCategories(response.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (index, value) => {
    const newImages = [...form.product_imageurl]
    newImages[index] = value
    setForm((prev) => ({ ...prev, product_imageurl: newImages }))
  }

  const addImageField = () => {
    setForm((prev) => ({
      ...prev,
      product_imageurl: [...prev.product_imageurl, ""],
    }))
  }

  const removeImageField = (index) => {
    if (form.product_imageurl.length > 1) {
      const newImages = [...form.product_imageurl]
      newImages.splice(index, 1)
      setForm((prev) => ({ ...prev, product_imageurl: newImages }))
    }
  }

  const validateForm = () => {
    if (!form.product_name || !form.product_price || !form.product_quantity || !form.product_category_id) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return false;
    }

    // Kiểm tra độ dài
    if (form.product_name.trim().length > 100) {
      setError("Tên sản phẩm không được vượt quá 100 ký tự.");
      return false;
    }
    if (form.product_description && form.product_description.trim().length > 1000) {
      setError("Mô tả sản phẩm không được vượt quá 1000 ký tự.");
      return false;
    }

    // Không cho nhập toàn dấu cách
    if (!form.product_name.trim()) {
      setError("Tên sản phẩm không được để trống hoặc chỉ chứa dấu cách.");
      return false;
    }

    // Kiểm tra từ nhạy cảm
    if (containsSensitiveWords(form.product_name) || containsSensitiveWords(form.product_description)) {
      setError("Vui lòng không nhập từ ngữ không phù hợp hoặc nhạy cảm.");
      return false;
    }

    if (Number.parseFloat(form.product_price) <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0.");
      return false;
    }

    if (Number.parseInt(form.product_quantity) <= 0) {
      setError("Số lượng sản phẩm phải lớn hơn 0.");
      return false;
    }

    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await axios.post(`${baseUrl}/reptitist/shop/products/create`, form)

      // Show success message
      alert("Thêm sản phẩm thành công!")
      navigate(`/products-by-category/${form.product_category_id}`)
    } catch (err) {
      console.error(err)
      setError("Lỗi khi thêm sản phẩm. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="text-center">
            <div className="spinner-border text-success mb-3" role="status"></div>
            <p className="text-muted">Đang tải dữ liệu...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <Container style={{ maxWidth: 700, paddingTop: 40, paddingBottom: 40 }}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h2 className="mb-4 text-center">
              <Package size={28} className="me-2 text-primary align-text-bottom" />
              Thêm sản phẩm mới
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <Package size={18} className="me-2 text-primary" />
                  Tên sản phẩm *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên sản phẩm"
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <DollarSign size={16} className="me-2 text-success" />
                      Giá *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="product_price"
                      value={form.product_price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Nhập giá sản phẩm"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <Hash size={16} className="me-2 text-info" />
                      Số lượng *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="product_quantity"
                      value={form.product_quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="Nhập số lượng"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>
                  <Tag size={16} className="me-2 text-warning" />
                  Danh mục *
                </Form.Label>
                <Form.Select
                  name="product_category_id"
                  value={form.product_category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.product_category_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <ImageIcon size={16} className="me-2 text-secondary" />
                  Mô tả sản phẩm
                </Form.Label>
                <Form.Control
                  as="textarea"
                  name="product_description"
                  rows={4}
                  value={form.product_description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả chi tiết về sản phẩm"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <ImageIcon size={16} className="me-2 text-danger" />
                  Hình ảnh sản phẩm
                </Form.Label>
                {form.product_imageurl.map((img, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <Form.Control
                      type="url"
                      value={img}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder={`URL hình ảnh ${index + 1}`}
                      className="me-2"
                    />
                    {form.product_imageurl.length > 1 && (
                      <Button
                        variant="outline-danger"
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="me-2 d-flex align-items-center"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline-primary" type="button" onClick={addImageField} className="d-flex align-items-center">
                  <Plus size={16} className="me-1" /> Thêm ảnh
                </Button>
              </Form.Group>
              <div className="d-flex justify-content-center mt-4">
                <Button variant="success" type="submit" size="lg" disabled={isSubmitting} className="d-flex align-items-center">
                  {isSubmitting ? (
                    <>
                      <Package size={18} className="me-2" /> Đang lưu sản phẩm...
                    </>
                  ) : (
                    <>
                      <Package size={18} className="me-2" /> Lưu sản phẩm
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
  )
}

export default AddProduct;
