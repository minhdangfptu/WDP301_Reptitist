import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Row, Col } from "react-bootstrap";
const TermsAndPolicies = () => (
  <>
    <Header />
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <h1 style={{ color: "#0fa958", fontWeight: 800, fontSize: "2.2rem", marginBottom: 16 , textAlign: "center"}}>Chính sách & Điều khoản</h1>
      <div style={{ marginTop: 10, color: "#888", fontSize: 14, textAlign: "center" }}>
        Cập nhật lần cuối: 01/06/2025
      </div>
      
      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>1. Giới thiệu</h2>
      <p>
        Chào mừng bạn đến với Reptitist! Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản và chính sách dưới đây. Vui lòng đọc kỹ để hiểu rõ quyền lợi và trách nhiệm của bạn khi sử dụng website và các dịch vụ liên quan.
      </p>
      
      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>2. Định nghĩa</h2>
      <ul>
        <li><b>"Dịch vụ"</b> là toàn bộ các sản phẩm, tính năng, nội dung, công cụ, ứng dụng và website do Reptitist cung cấp.</li>
        <li><b>"Người dùng"</b> là cá nhân hoặc tổ chức truy cập, sử dụng dịch vụ của Reptitist.</li>
        <li><b>"Chúng tôi"</b> là đội ngũ phát triển và vận hành Reptitist.</li>
      </ul>

      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>3. Quyền và trách nhiệm của người dùng</h2>
      <ul>
        <li>Không sử dụng dịch vụ cho mục đích vi phạm pháp luật, phát tán thông tin sai lệch, lừa đảo, hoặc gây hại cho người khác.</li>
        <li>Bảo mật thông tin tài khoản cá nhân, không chia sẻ mật khẩu cho người khác.</li>
        <li>Chịu trách nhiệm về nội dung bạn đăng tải, bao gồm nhưng không giới hạn ở bài viết, bình luận, hình ảnh, video.</li>
        <li>Không can thiệp, phá hoại hệ thống hoặc làm gián đoạn dịch vụ.</li>
        <li>Tuân thủ các quy định về bản quyền, quyền sở hữu trí tuệ khi sử dụng và chia sẻ nội dung.</li>
        <li>Không sử dụng các công cụ tự động (bot, script...) để truy cập hoặc khai thác dữ liệu trái phép.</li>
        <li>Thông báo ngay cho chúng tôi khi phát hiện lỗ hổng bảo mật hoặc hành vi sử dụng trái phép.</li>
      </ul>

      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>4. Quyền và trách nhiệm của Reptitist</h2>
      <ul>
        <li>Bảo vệ thông tin cá nhân của người dùng theo <b>Chính sách bảo mật</b> bên dưới.</li>
        <li>Có quyền thay đổi, tạm ngưng hoặc ngừng cung cấp dịch vụ mà không cần báo trước.</li>
        <li>Có quyền xóa, chỉnh sửa, hoặc từ chối các nội dung vi phạm điều khoản hoặc pháp luật.</li>
        <li>Không chịu trách nhiệm với các thiệt hại phát sinh ngoài ý muốn do người dùng vi phạm điều khoản.</li>
        <li>Có quyền cập nhật, sửa đổi điều khoản và chính sách bất cứ lúc nào. Thông báo sẽ được đăng tải trên website.</li>
      </ul>

      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>5. Quyền sở hữu trí tuệ</h2>
      <ul>
        <li>Tất cả nội dung, hình ảnh, mã nguồn, logo, nhãn hiệu trên website thuộc quyền sở hữu của Reptitist hoặc các bên liên kết, được bảo hộ bởi pháp luật.</li>
        <li>Người dùng không được phép sao chép, tái sử dụng, phát hành lại bất kỳ nội dung nào khi chưa có sự đồng ý bằng văn bản của Reptitist.</li>
        <li>Nếu bạn cho rằng quyền sở hữu trí tuệ của mình bị xâm phạm, vui lòng liên hệ với chúng tôi để được hỗ trợ giải quyết.</li>
      </ul>

      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>6. Chính sách bảo mật</h2>
      <ul>
        <li>Chúng tôi cam kết bảo mật thông tin cá nhân của bạn. Mọi thông tin thu thập chỉ phục vụ cho mục đích nâng cao chất lượng dịch vụ và sẽ không chia sẻ cho bên thứ ba nếu không có sự đồng ý của bạn, trừ trường hợp pháp luật yêu cầu.</li>
        <li>Chúng tôi sử dụng các biện pháp kỹ thuật và tổ chức hợp lý để bảo vệ dữ liệu khỏi truy cập trái phép, mất mát hoặc phá hoại.</li>
        <li>Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất cứ lúc nào.</li>
        <li>Chúng tôi có thể sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm người dùng.</li>
      </ul>

      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>7. Giới hạn trách nhiệm</h2>
      <ul>
        <li>Chúng tôi không chịu trách nhiệm với các thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc hệ quả phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.</li>
        <li>Chúng tôi không đảm bảo dịch vụ sẽ luôn an toàn, không có lỗi hoặc không bị gián đoạn.</li>
        <li>Người dùng tự chịu trách nhiệm với các quyết định dựa trên thông tin, nội dung trên website.</li>
      </ul>

      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>8. Liên kết đến website bên thứ ba</h2>
      <ul>
        <li>Website có thể chứa liên kết đến các website hoặc dịch vụ của bên thứ ba. Chúng tôi không kiểm soát và không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc hoạt động của các website đó.</li>
        <li>Bạn nên đọc kỹ điều khoản và chính sách của các website bên ngoài trước khi sử dụng.</li>
      </ul>

      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>9. Điều khoản bổ sung</h2>
      <ul>
        <li>Nếu một điều khoản nào đó bị vô hiệu hóa, các điều khoản còn lại vẫn giữ nguyên hiệu lực.</li>
        <li>Việc bạn tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi đó.</li>
      </ul>

      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>10. Luật áp dụng và giải quyết tranh chấp</h2>
      <ul>
        <li>Điều khoản này được điều chỉnh và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</li>
        <li>Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết bằng thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.</li>
      </ul>

      <h2 style={{ color: "#0fa958", fontWeight: 700, fontSize: "1.3rem", marginTop: 32 }}>11. Liên hệ</h2>
      <p>
        Nếu bạn có bất kỳ câu hỏi nào về điều khoản hoặc chính sách, vui lòng liên hệ: <b>reptitist.service@gmail.com</b>
      </p>
      <div style={{ marginTop: 40, color: "#006934", fontSize: 14, textAlign: "center", alignItems: "center"}}>
        <Row>
        <Col>
        <a href="/Login" style={{ cursor: "pointer" }}>Quay lại trang Đăng nhập</a>
        </Col>
        <Col>
        <a href="/" style={{ cursor: "pointer" }}>Quay lại trang chủ</a>
        </Col>
        <Col>
        <a href="/" style={{ cursor: "pointer" }}>Quay lại trang Đăng ký</a>
        </Col>
        </Row>
      </div>
    </div>
    <Footer />
  </>
);

export default TermsAndPolicies;