import React, { useRef, useState, useEffect } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

const ContactUs = () => {
  const form = useRef();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    subject: '',
    message: ''
  });


  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        user_name: user.username || '',
        user_email: user.email || '',
        user_phone: user.phone_number || ''
      }));
    }
  }, [user]);

  // Hàm kiểm tra email hợp lệ
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Hàm kiểm tra số điện thoại hợp lệ
  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra các trường bắt buộc
    if (!formData.user_name || !formData.user_email || !formData.user_phone || !formData.subject || !formData.message) {
      toast.error('Vui lòng điền đầy đủ thông tin!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Kiểm tra email hợp lệ
    if (!isValidEmail(formData.user_email)) {
      toast.error('Email không hợp lệ!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Kiểm tra số điện thoại hợp lệ
    if (!isValidPhone(formData.user_phone)) {
      toast.error('Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);

    try {
      // Tạo nội dung email với bố cục đẹp hơn
      const emailBody = `
===========================================
THÔNG TIN LIÊN HỆ - GÓP Ý TỚI WEBSITE REPTITIST
===========================================

👤 THÔNG TIN NGƯỜI GỬI
----------------------
• Họ và tên: ${formData.user_name}
• Email: ${formData.user_email}
• Số điện thoại: ${formData.user_phone}

📝 NỘI DUNG GÓP Ý - PHẢN HỒI
-------------------
${formData.message}

===========================================
Thời gian gửi: ${new Date().toLocaleString('vi-VN')}
===========================================
      `;

      // Tạo URL Gmail với thông tin đã điền sẵn
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=reptitist.service@gmail.com&su=${encodeURIComponent(`[REPTITIST - GÓP Ý - PHẢN HỒI] ${formData.subject}`)}&body=${encodeURIComponent(emailBody)}`;

      // Mở Gmail trong tab mới
      window.open(gmailUrl, '_blank');

      toast.success('Đang mở Gmail...', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset form
      setFormData({
        user_name: '',
        user_email: '',
        user_phone: '',
        subject: '',
        message: ''
      });
      
      // Reset form ref
      if (form.current) {
        form.current.reset();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="page-title">
        <div className="container">
          <h1>LIÊN HỆ</h1>
        </div>
      </div>

      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Liên hệ với chúng tôi</h2>
              <p>Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến đóng góp của bạn để phát triển dịch vụ ngày càng tốt hơn.</p>
              <div className="social-icons">
                <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-youtube"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-tiktok"></i></a>
              </div>
            </div>
            <div className="contact-form">
              <form ref={form} onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="user_name"
                    className="form-control"
                    placeholder="Tên của bạn"
                    value={formData.user_name}
                    onChange={handleChange}
                    required
                    readOnly={!!user}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="user_email"
                    className="form-control"
                    placeholder="Email"
                    value={formData.user_email}
                    onChange={handleChange}
                    required
                    readOnly={!!user}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    name="user_phone"
                    className="form-control"
                    placeholder="Số điện thoại"
                    value={formData.user_phone}
                    onChange={handleChange}
                    required
                    readOnly={!!user}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="subject"
                    className="form-control"
                    placeholder="Tiêu đề"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    className="form-control"
                    placeholder="Nội dung"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'ĐANG GỬI...' : 'GỬI Ý KIẾN'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="container">
          <div className="map-container">
            <img src="map.png" alt="Bản đồ" />
            <div className="contact-cards">
              <div className="contact-card">
                <div className="card-icon"><i className="fas fa-map-marker-alt"></i></div>
                <div className="card-content">
                  <h3>Địa chỉ của tôi</h3>
                  <p>DELTA Building, FPT University, Hòa Lạc, Hà Nội</p>
                </div>
              </div>
              <div className="contact-card">
                <div className="card-icon"><i className="fas fa-phone-alt"></i></div>
                <div className="card-content">
                  <h3>Số điện thoại</h3>
                  <p>0987654321</p>
                </div>
              </div>
              <div className="contact-card">
                <div className="card-icon"><i className="fas fa-envelope"></i></div>
                <div className="card-content">
                  <h3>Email</h3>
                  <p>reptitist.service@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ContactUs;
