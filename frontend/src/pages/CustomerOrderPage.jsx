"use client"

import { Package } from "lucide-react"
import Header from "./Header"
import "./OrderPage.css"

const CustomerOrderPage = () => {
  // Đây chỉ là component mẫu để minh họa việc sử dụng Header với pageTitle khác
  return (
    <>
      {/* Sử dụng Header component với pageTitle và pageIcon khác */}
      <Header pageTitle="Đơn Hàng" pageIcon={Package} />

      <div className="order-page">
        <div className="container">
          <div className="order-content">
            <h2>Danh sách đơn hàng của bạn</h2>
            <p>Đây là trang đơn hàng, sử dụng cùng một Header component nhưng với tiêu đề khác.</p>

            <div className="order-list">
              <div className="order-item">
                <div className="order-header">
                  <div className="order-id">Đơn hàng #12345</div>
                  <div className="order-date">Ngày đặt: 15/06/2023</div>
                  <div className="order-status pending">Đang xử lý</div>
                </div>
                <div className="order-details">
                  <div className="order-products">
                    <p>3 sản phẩm</p>
                    <p>Tổng tiền: 2,447,000₫</p>
                  </div>
                  <button className="view-order-btn">Xem chi tiết</button>
                </div>
              </div>

              <div className="order-item">
                <div className="order-header">
                  <div className="order-id">Đơn hàng #12344</div>
                  <div className="order-date">Ngày đặt: 10/06/2023</div>
                  <div className="order-status completed">Đã giao</div>
                </div>
                <div className="order-details">
                  <div className="order-products">
                    <p>2 sản phẩm</p>
                    <p>Tổng tiền: 1,198,000₫</p>
                  </div>
                  <button className="view-order-btn">Xem chi tiết</button>
                </div>
              </div>

              <div className="order-item">
                <div className="order-header">
                  <div className="order-id">Đơn hàng #12343</div>
                  <div className="order-date">Ngày đặt: 05/06/2023</div>
                  <div className="order-status cancelled">Đã hủy</div>
                </div>
                <div className="order-details">
                  <div className="order-products">
                    <p>1 sản phẩm</p>
                    <p>Tổng tiền: 999,000₫</p>
                  </div>
                  <button className="view-order-btn">Xem chi tiết</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomerOrderPage
