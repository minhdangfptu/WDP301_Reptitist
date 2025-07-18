const nodemailer = require('nodemailer');

// Cấu hình transporter cho Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendProductReportNotification = async (shopEmail, shopName, productName, reportReason, adminNote, productId) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'reptitist.service@gmail.com',
      to: shopEmail,
      subject: '[REPTITIST] Thông báo về báo cáo sản phẩm',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e74c3c; margin: 0; font-size: 24px;">⚠️ THÔNG BÁO VỀ BÁO CÁO SẢN PHẨM</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Xin chào <strong>${shopName}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Chúng tôi xin thông báo rằng sản phẩm <strong>"${productName}"</strong> của bạn đã bị báo cáo.
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #856404; margin-top: 0; font-size: 18px;">📋 Chi tiết báo cáo:</h3>
              <ul style="color: #856404; font-size: 14px; line-height: 1.6;">
                <li><strong>Sản phẩm:</strong> ${productName}</li>
                <li><strong>Lý do báo cáo:</strong> ${reportReason}</li>
                <li><h2>Ghi chú của admin:</h2><h2> ${adminNote || 'Không có ghi chú'}</h2></li>
                <li><strong>Thời gian xử lý:</strong> ${new Date().toLocaleString('vi-VN')}</li>
              </ul>
            </div>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #155724; margin-top: 0; font-size: 18px;">🔧 Hành động đã thực hiện:</h3>
              <p style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0;">
                Sản phẩm đã được chuyển sang trạng thái "Không khả dụng" và ẩn khỏi cửa hàng.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #495057; margin-top: 0; font-size: 18px;">💡 Hướng dẫn tiếp theo:</h3>
              <ul style="color: #495057; font-size: 14px; line-height: 1.6;">
                <li>Kiểm tra lại sản phẩm và đảm bảo tuân thủ quy định của Reptitist</li>
                <li>Nếu cần thiết, chỉnh sửa thông tin sản phẩm và liên hệ admin để được xem xét lại</li>
                <li>Để tránh vi phạm trong tương lai, vui lòng đọc kỹ <a href="#" style="color: #007bff;">Quy định cộng đồng</a></li>
              </ul>
            </div>
            <div style="text-align:center; margin: 30px 0;">
              <a href="http://localhost:5173/shop/complain?productId=${productId}" style="display:inline-block; background:#e74c3c; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">Khiếu nại</a>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Email này được gửi tự động từ hệ thống Reptitist.<br>
                Nếu bạn có thắc mắc, vui lòng liên hệ: <a href="mailto:support@reptitist.com" style="color: #007bff;">support@reptitist.com</a>
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi email thông báo khi admin gỡ bỏ ẩn sản phẩm
const sendProductUnhideNotification = async (shopEmail, shopName, productName, adminName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'reptitist.service@gmail.com',
      to: shopEmail,
      subject: '[REPTITIST] Thông báo sản phẩm đã được gỡ bỏ ẩn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #27ae60; margin: 0; font-size: 24px;">✅ SẢN PHẨM ĐÃ ĐƯỢC GỠ BỎ ẨN</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Xin chào <strong>${shopName}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Chúng tôi xin thông báo rằng sản phẩm <strong>"${productName}"</strong> của bạn đã được admin gỡ bỏ ẩn và có thể bán lại.
              </p>
            </div>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #155724; margin-top: 0; font-size: 18px;">📋 Chi tiết thông báo:</h3>
              <ul style="color: #155724; font-size: 14px; line-height: 1.6;">
                <li><strong>Sản phẩm:</strong> ${productName}</li>
                <li><strong>Admin xử lý:</strong> ${adminName}</li>
                <li><strong>Thời gian xử lý:</strong> ${new Date().toLocaleString('vi-VN')}</li>
                <li><strong>Trạng thái mới:</strong> Đang bán</li>
              </ul>
            </div>
            
            <div style="background-color: #e8f5e8; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #155724; margin-top: 0; font-size: 18px;">🎉 Hành động đã thực hiện:</h3>
              <p style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0;">
                Sản phẩm đã được chuyển sang trạng thái "Đang bán" và hiển thị lại trong cửa hàng của bạn.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #495057; margin-top: 0; font-size: 18px;">💡 Hướng dẫn tiếp theo:</h3>
              <ul style="color: #495057; font-size: 14px; line-height: 1.6;">
                <li>Sản phẩm của bạn đã có thể bán lại bình thường</li>
                <li>Kiểm tra lại thông tin sản phẩm để đảm bảo chính xác</li>
                <li>Đảm bảo tuân thủ quy định của Reptitist để tránh bị ẩn lại</li>
                <li>Nếu có thắc mắc, vui lòng liên hệ admin hoặc support team</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Email này được gửi tự động từ hệ thống Reptitist.<br>
                Nếu bạn có thắc mắc, vui lòng liên hệ: <a href="mailto:support@reptitist.com" style="color: #007bff;">support@reptitist.com</a>
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Product unhide email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending product unhide email:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi email thông báo khi admin xóa sản phẩm
const sendProductDeleteNotification = async (shopEmail, shopName, productName, adminName, deleteReason = '') => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'reptitist.service@gmail.com',
      to: shopEmail,
      subject: '[REPTITIST] Thông báo sản phẩm đã bị xóa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e74c3c; margin: 0; font-size: 24px;">🗑️ SẢN PHẨM ĐÃ BỊ XÓA</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Xin chào <strong>${shopName}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Chúng tôi xin thông báo rằng sản phẩm <strong>"${productName}"</strong> của bạn đã bị admin xóa khỏi hệ thống.
              </p>
            </div>
            
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #721c24; margin-top: 0; font-size: 18px;">📋 Chi tiết xóa sản phẩm:</h3>
              <ul style="color: #721c24; font-size: 14px; line-height: 1.6;">
                <li><strong>Sản phẩm:</strong> ${productName}</li>
                <li><strong>Admin xử lý:</strong> ${adminName}</li>
                <li><strong>Thời gian xóa:</strong> ${new Date().toLocaleString('vi-VN')}</li>
                ${deleteReason ? `<li><h2>Lý do xóa:</h2> <h2>${deleteReason}</h2></li>` : ''}
              </ul>
            </div>
            
            
            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #495057; margin-top: 0; font-size: 18px;">💡 Hướng dẫn tiếp theo:</h3>
              <ul style="color: #495057; font-size: 14px; line-height: 1.6;">
                <li>Nếu bạn muốn bán lại sản phẩm tương tự, vui lòng tạo sản phẩm mới</li>
                <li>Đảm bảo tuân thủ quy định của Reptitist khi tạo sản phẩm mới</li>
                <li>Nếu có thắc mắc về việc xóa sản phẩm, vui lòng liên hệ admin</li>
                <li>Để tránh vi phạm trong tương lai, vui lòng đọc kỹ <a href="#" style="color: #007bff;">Quy định cộng đồng</a></li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Email này được gửi tự động từ hệ thống Reptitist.<br>
                Nếu bạn có thắc mắc, vui lòng liên hệ: <a href="mailto:support@reptitist.com" style="color: #007bff;">support@reptitist.com</a>
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Product delete email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending product delete email:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi email thông báo khi admin ẩn sản phẩm
const sendProductHideNotification = async (shopEmail, shopName, productName, adminName, hideReason, productId) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'reptitist.service@gmail.com',
      to: shopEmail,
      subject: '[REPTITIST] Thông báo sản phẩm đã bị ẩn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e67e22; margin: 0; font-size: 24px;">🚫 SẢN PHẨM ĐÃ BỊ ẨN</h1>
            </div>
            <div style="margin-bottom: 25px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Xin chào <strong>${shopName}</strong>,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Chúng tôi xin thông báo rằng sản phẩm <strong>"${productName}"</strong> của bạn đã bị admin ẩn khỏi cửa hàng và không còn hiển thị cho khách hàng.
              </p>
            </div>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #856404; margin-top: 0; font-size: 18px;">📋 Chi tiết thông báo:</h3>
              <ul style="color: #856404; font-size: 14px; line-height: 1.6;">
                <li><strong>Sản phẩm:</strong> ${productName}</li>
                <li><strong>Admin xử lý:</strong> ${adminName}</li>
                <li><strong>Thời gian xử lý:</strong> ${new Date().toLocaleString('vi-VN')}</li>
                <li><strong>Trạng thái mới:</strong> Đã bị ẩn</li>
                <li><strong>Lý do ẩn:</strong> <span style="color: #d35400; font-weight: bold;">${hideReason || 'Không có ghi chú'}</span></li>
              </ul>
            </div>
            <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #495057; margin-top: 0; font-size: 18px;">💡 Hướng dẫn tiếp theo:</h3>
              <ul style="color: #495057; font-size: 14px; line-height: 1.6;">
                <li>Kiểm tra lại sản phẩm và chỉnh sửa nếu cần thiết</li>
                <li>Liên hệ admin nếu bạn cho rằng đây là nhầm lẫn</li>
                <li>Đảm bảo tuân thủ quy định của Reptitist để tránh bị ẩn sản phẩm trong tương lai</li>
              </ul>
            </div>
            <div style="text-align:center; margin: 30px 0;">
              <a href="http://localhost:5173/shop/complain?productId=${productId}" style="display:inline-block; background:#e74c3c; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">Khiếu nại</a>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                Email này được gửi tự động từ hệ thống Reptitist.<br>
                Nếu bạn có thắc mắc, vui lòng liên hệ: <a href="mailto:support@reptitist.com" style="color: #007bff;">support@reptitist.com</a>
              </p>
            </div>
          </div>
        </div>
      `
    };
    const result = await transporter.sendMail(mailOptions);
    console.log('Product hide email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending product hide email:', error);
    return { success: false, error: error.message };
  }
};

const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email server connection verified successfully');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};

module.exports = {
  transporter,
  sendProductReportNotification,
  sendProductUnhideNotification,
  sendProductDeleteNotification,
  sendProductHideNotification,
  testEmailConnection
}; 