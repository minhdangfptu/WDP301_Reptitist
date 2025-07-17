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
    subject: '',
    message: ''
  });

  // Tự động fill thông tin nếu user đã đăng nhập
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        user_name: user.username || '',
        user_email: user.email || '',
      }));
    }
  }, [user]);

  // Hàm kiểm tra email hợp lệ
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!formData.user_name || !formData.user_email || !formData.subject || !formData.message) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
  
    if (!isValidEmail(formData.user_email)) {
      toast.error('Email không hợp lệ!');
      return;
    }
  
    // Tạo body
    const emailBody = `
  ===========================================
  THÔNG TIN LIÊN HỆ - GÓP Ý TỚI WEBSITE REPTITIST
  ===========================================
  
  👤 THÔNG TIN NGƯỜI GỬI
  ----------------------
  • Họ và tên: ${formData.user_name}
  • Email: ${formData.user_email}

  📝 NỘI DUNG GÓP Ý - PHẢN HỒI
  -------------------
  ${formData.message}
  
  ===========================================
  Thời gian gửi: ${new Date().toLocaleString('vi-VN')}
  ===========================================
    `;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=reptitist.service@gmail.com&su=${encodeURIComponent(`[REPTITIST - GÓP Ý - PHẢN HỒI] ${formData.subject}`)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank');
  

    toast.success('Đang mở Gmail...');
  
    setFormData({
      user_name: '',
      user_email: '',
      subject: '',
      message: ''
    });
  
    if (form.current) {
      form.current.reset();
    }
  };
  

  return (
    <>
      <Header />

      <div className="page-title">
        <div className="container">
          <h1>GÓP Ý - PHẢN HỒI</h1>
        </div>
      </div>

      <section style={{marginTop: '30px'}} className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Góp ý cho chúng tôi</h2>
              <p>Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến đóng góp của bạn để phát triển dịch vụ ngày càng tốt hơn.</p>
              <div className="social-icons">
                <a href="https://www.facebook.com/profile.php?id=61576867780640" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                <a href="https://www.facebook.com/profile.php?id=61576867780640" className="social-icon"><i className="fab fa-instagram"></i></a>
                <a href="https://www.youtube.com/@ServiceReptitist" className="social-icon"><i className="fab fa-youtube"></i></a>
                <a href="https://www.youtube.com/@ServiceReptitist" className="social-icon"><i className="fab fa-tiktok"></i></a>
              </div>
              <p style={{ marginTop: '20px', marginBottom: '10px', textAlign: 'left' }}>
                Hoặc gửi ý kiến, phản hồi qua Google Form
              </p>
              <a 
                href="https://forms.gle/FdUEYMKnZ5i4yCjP7" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '40%',
                  textAlign: 'center',
                  fontWeight: '400',
                  padding: '7px 5px',
                  backgroundColor: 'transparent',
                  color: '#0fa958',
                  border: '1px solid #0fa958',
                  textDecoration: 'none',
                  borderRadius: '30px',
                  marginTop: '10px',
                  transition: 'background-color 0.3s, color 0.3s',
                }}
                onMouseOver={e => {
                  e.target.style.backgroundColor = '#0fa958';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#0fa958';
                }}
              >
                Google Form
              </a>
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
                  <p>DELTA Building, FPT University</p>
                </div>
              </div>
              <div className="contact-card">
                <div className="card-icon"><i className="fas fa-phone-alt"></i></div>
                <div className="card-content">
                  <h3>Số điện thoại</h3>
                  <p>0398826650</p>
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