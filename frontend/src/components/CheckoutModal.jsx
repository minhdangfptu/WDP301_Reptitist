import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, ShoppingCart } from 'lucide-react';
import '../css/CheckoutModal.css';

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedItems, 
  totalAmount,
  user 
}) => {
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phoneNumber: '',
    delivery_address: '',
    note: ''
  });

  const [addressOption, setAddressOption] = useState('default');
  const [customAddress, setCustomAddress] = useState('');
  const [errors, setErrors] = useState({});

  // Load user info when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setDeliveryInfo({
        fullName: user.fullname || user.username || '',
        phoneNumber: user.phone_number || '',
        delivery_address: user.address || '',
        note: ''
      });
      
      setAddressOption(user.address ? 'default' : 'new');
      setCustomAddress('');
    }
  }, [isOpen, user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!deliveryInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!deliveryInfo.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(deliveryInfo.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 chữ số)';
    }

    if (addressOption === 'default') {
      if (!user?.address?.trim()) {
        newErrors.address = 'Không có địa chỉ mặc định. Vui lòng chọn "Nhập địa chỉ mới"';
      }
    } else {
      if (!customAddress.trim()) {
        newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setDeliveryInfo(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const finalDeliveryInfo = {
        ...deliveryInfo,
        delivery_address: addressOption === 'default' ? user.address : customAddress
      };
      onConfirm(finalDeliveryInfo);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal-content">
        {/* Header */}
        <div className="checkout-modal-header">
          <h2 className="checkout-modal-title">
            <ShoppingCart size={20} />
            Xác nhận thông tin giao hàng
          </h2>
          <button onClick={onClose} className="checkout-modal-close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="checkout-modal-body">
          {/* Order Summary */}
          <div className="checkout-order-summary">
            <h3 className="checkout-summary-title">Tóm tắt đơn hàng</h3>
            <div className="checkout-summary-items">
              {selectedItems.map((item, index) => (
                <div key={index} className="checkout-summary-item">
                  <span className="checkout-product-name">
                    {item.product_name ||item.product_id?.product_name || 'Sản phẩm'} x{item.quantity}
                  </span>
                  <span className="checkout-product-price">
                    {formatPrice((item.price ||item.product_id?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="checkout-summary-divider"></div>
              <div className="checkout-summary-total">
                <span>Tổng cộng:</span>
                <span className="checkout-total-price">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information Form */}
          <div className="checkout-form-section">
            <h3 className="checkout-section-title">
              <MapPin size={20} />
              Thông tin giao hàng
            </h3>

            {/* Full Name */}
            <div className="checkout-form-group">
              <label className="checkout-form-label">
                <User size={16} />
                Họ và tên <span className="checkout-required">*</span>
              </label>
              <input
                type="text"
                value={deliveryInfo.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`checkout-form-input ${errors.fullName ? 'checkout-input-error' : ''}`}
                placeholder="Nhập họ và tên người nhận"
              />
              {errors.fullName && (
                <p className="checkout-error-message">{errors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="checkout-form-group">
              <label className="checkout-form-label">
                <Phone size={16} />
                Số điện thoại <span className="checkout-required">*</span>
              </label>
              <input
                type="tel"
                value={deliveryInfo.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className={`checkout-form-input ${errors.phoneNumber ? 'checkout-input-error' : ''}`}
                placeholder="Nhập số điện thoại người nhận"
              />
              {errors.phoneNumber && (
                <p className="checkout-error-message">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Address Options */}
            <div className="checkout-form-group">
              <label className="checkout-form-label">
                <MapPin size={16} />
                Địa chỉ giao hàng <span className="checkout-required">*</span>
              </label>
              
              <div className="checkout-address-options">
                {/* Default Address Option */}
                {user?.address && (
                  <div className={`checkout-address-option ${addressOption === 'default' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      id="default-address"
                      name="addressOption"
                      value="default"
                      checked={addressOption === 'default'}
                      onChange={(e) => {
                        setAddressOption(e.target.value);
                        if (errors.address) {
                          setErrors(prev => ({ ...prev, address: '' }));
                        }
                      }}
                    />
                    <label htmlFor="default-address" className="checkout-address-label">
                      <div className="checkout-address-title">
                        Sử dụng địa chỉ mặc định
                      </div>
                      <div className="checkout-default-address">
                        {user.address}
                      </div>
                    </label>
                  </div>
                )}

                {/* New Address Option */}
                <div className={`checkout-address-option ${addressOption === 'new' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    id="new-address"
                    name="addressOption"
                    value="new"
                    checked={addressOption === 'new'}
                    onChange={(e) => {
                      setAddressOption(e.target.value);
                      if (errors.address) {
                        setErrors(prev => ({ ...prev, address: '' }));
                      }
                    }}
                  />
                  <label htmlFor="new-address" className="checkout-address-label">
                    <div className="checkout-address-title">
                      {user?.address ? 'Nhập địa chỉ mới' : 'Nhập địa chỉ giao hàng'}
                    </div>
                    {addressOption === 'new' && (
                      <div className="checkout-custom-address">
                        <textarea
                          value={customAddress}
                          onChange={(e) => {
                            setCustomAddress(e.target.value);
                            if (errors.address) {
                              setErrors(prev => ({ ...prev, address: '' }));
                            }
                          }}
                          rows={3}
                          className={`checkout-form-textarea ${errors.address ? 'checkout-input-error' : ''}`}
                          placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                        />
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              {errors.address && (
                <p className="checkout-error-message">{errors.address}</p>
              )}
            </div>

            {/* Note */}
            <div className="checkout-form-group">
              <label className="checkout-form-label">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={deliveryInfo.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                rows={2}
                className="checkout-form-textarea"
                placeholder="Ghi chú cho người bán (thời gian giao hàng, yêu cầu đặc biệt...)"
              />
            </div>
          </div>

          {/* Info Note */}
          <div className="checkout-info-note">
            <p>
              <strong>Lưu ý:</strong> Thông tin này sẽ được gửi cho người bán để giao hàng. 
              Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="checkout-modal-footer">
          <button onClick={onClose} className="checkout-btn checkout-btn-cancel">
            Hủy
          </button>
          <button onClick={handleSubmit} className="checkout-btn checkout-btn-confirm">
            Xác nhận đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;