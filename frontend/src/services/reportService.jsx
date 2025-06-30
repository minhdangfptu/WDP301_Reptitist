// src/services/reportService.jsx
import reportApi from "../api/reportApi";

const reportProductService = async (productId, reason, description) => {
  try {
    const response = await reportApi.reportProduct(productId, reason, description);
    return response.data;
  } catch (error) {
    console.error("Error reporting product:", error);
    const message = error.response?.data?.message || "Gửi báo cáo thất bại";
    if (error.response?.status === 400) {
      throw new Error(message || "Dữ liệu báo cáo không hợp lệ");
    } else if (error.response?.status === 401) {
      throw new Error("Bạn cần đăng nhập để báo cáo");
    } else if (error.response?.status === 404) {
      throw new Error("Sản phẩm không tồn tại");
    } else if (error.response?.status === 409) {
      throw new Error("Bạn đã báo cáo sản phẩm này rồi");
    }
    throw new Error(message);
  }
};

export { reportProductService };