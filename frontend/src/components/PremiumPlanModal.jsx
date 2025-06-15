// components/PremiumPlanModal.jsx
import React, { useState } from 'react';
import { X, Check, Calendar, CreditCard } from 'lucide-react';
import '../css/PremiumPlanModal.css';

const PremiumPlanModal = ({ isOpen, onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('momo');

  if (!isOpen) return null;

  const plans = {
    monthly: {
      id: 'monthly',
      name: 'Hàng tháng',
      price: 79000,
      originalPrice: 79000,
      period: 'tháng',
      savings: null,
      description: '7 ngày dùng thử miễn phí, hủy bất cứ lúc nào'
    },
    weekly: {
      id: 'weekly', 
      name: 'Hàng tuần',
      price: 39000,
      originalPrice: 39000,
      period: 'tuần',
      savings: null,
      description: 'Chúng tôi sẽ thông báo đến bạn trước khi hết hạn dùng thử'
    },
    daily: {
      id: 'daily',
      name: 'Hàng ngày (trả trước 3 ngày)',
      price: 9000,
      originalPrice: 27000,
      period: '3 ngày', 
      savings: '(27.000 đ/3 ngày)',
      description: 'Gói dùng thử khi bạn hứng thú trong giai đoạn dùng thử'
    }
  };

  const benefits = [
    '7 ngày dùng thử miễn phí, hủy bất cứ lúc nào',
    'Chúng tôi sẽ thông báo đến bạn trước khi hết hạn dùng thử'
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const calculateTotal = () => {
    const plan = plans[selectedPlan];
    const today = new Date();
    let paymentDate = new Date(today);
    
    if (selectedPlan === 'monthly') {
      paymentDate.setMonth(paymentDate.getMonth() + 1);
    } else if (selectedPlan === 'weekly') {
      paymentDate.setDate(paymentDate.getDate() + 7);
    } else {
      paymentDate.setDate(paymentDate.getDate() + 3);
    }

    return {
      ...plan,
      paymentDate: paymentDate.toLocaleDateString('vi-VN'),
      isFreeTrial: selectedPlan !== 'daily'
    };
  };

  const total = calculateTotal();

  const handleSubscribe = () => {
    onSubscribe(selectedPlan, paymentMethod);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 premium-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto premium-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors modal-close-button"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-semibold text-center flex-1">Nâng cấp gói của bạn</h2>
          <div className="w-8"></div>
        </div>

        {/* Plan Selector */}
        <div className="p-6">
          {/* Toggle Buttons */}
          <div className="flex mb-6">
            <button 
              className={`flex-1 py-3 px-4 text-sm font-medium border-2 rounded-l-full transition-all plan-toggle-button ${
                selectedPlan !== 'daily' 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : 'bg-white text-emerald-500 border-emerald-500'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <span className="relative">
                Định kỳ
                {selectedPlan !== 'daily' && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full free-trial-badge">
                    Dùng thử miễn phí
                  </span>
                )}
              </span>
            </button>
            <button 
              className={`flex-1 py-3 px-4 text-sm font-medium border-2 rounded-r-full transition-all plan-toggle-button ${
                selectedPlan === 'daily' 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : 'bg-white text-emerald-500 border-emerald-500'
              }`}
              onClick={() => setSelectedPlan('daily')}
            >
              Một lần
            </button>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 mb-3">
                <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0 benefit-check" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Plan Options */}
          <div className="space-y-3 mb-6">
            {Object.values(plans).map((plan) => (
              <div 
                key={plan.id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all plan-option-card ${
                  selectedPlan === plan.id 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center custom-radio ${
                      selectedPlan === plan.id ? 'selected' : ''
                    }`}>
                      {selectedPlan === plan.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{plan.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(plan.price)} đ {plan.savings && (
                          <span className="text-gray-400">{plan.savings}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Thanh toán vào {total.paymentDate}</span>
              <span className="font-semibold">{formatPrice(total.price)} đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Thanh toán hôm nay<br />
                <span className="text-emerald-600">
                  ({total.isFreeTrial ? '7 ngày dùng thử miễn phí' : 'Không có thời gian dùng thử'})
                </span>
              </span>
              <span className="font-semibold">
                {total.isFreeTrial ? '0 đ' : `${formatPrice(total.price)} đ`}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <CreditCard size={16} />
              Phương thức thanh toán
            </h3>
            
            <div className="space-y-2">
              {/* MoMo */}
              <div 
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all payment-method-card ${
                  paymentMethod === 'momo' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('momo')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center custom-radio ${
                    paymentMethod === 'momo' ? 'selected' : ''
                  }`}>
                    {paymentMethod === 'momo' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded flex items-center justify-center payment-icon">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    <span className="text-sm font-medium">MoMo</span>
                  </div>
                </div>
              </div>

              {/* ZaloPay */}
              <div 
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all payment-method-card ${
                  paymentMethod === 'zalopay' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('zalopay')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center custom-radio ${
                    paymentMethod === 'zalopay' ? 'selected' : ''
                  }`}>
                    {paymentMethod === 'zalopay' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center payment-icon">
                      <span className="text-white text-xs font-bold">Z</span>
                    </div>
                    <span className="text-sm font-medium">ZaloPay</span>
                  </div>
                </div>
              </div>

              {/* VNPay */}
              <div 
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all payment-method-card ${
                  paymentMethod === 'vnpay' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('vnpay')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center custom-radio ${
                    paymentMethod === 'vnpay' ? 'selected' : ''
                  }`}>
                    {paymentMethod === 'vnpay' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center payment-icon">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                    <span className="text-sm font-medium">VNPay</span>
                  </div>
                </div>
              </div>

              {/* Banking */}
              <div 
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all payment-method-card ${
                  paymentMethod === 'banking' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('banking')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center custom-radio ${
                    paymentMethod === 'banking' ? 'selected' : ''
                  }`}>
                    {paymentMethod === 'banking' && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center payment-icon">
                      <span className="text-white text-xs font-bold">B</span>
                    </div>
                    <span className="text-sm font-medium">Internet Banking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribe Button */}
          <button 
            onClick={handleSubscribe}
            className="w-full bg-emerald-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl subscribe-button"
          >
            Tiếp tục
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
            Bằng cách tiếp tục, bạn đồng ý với các{' '}
            <a href="#" className="text-emerald-500 underline hover:text-emerald-600">
              Điều khoản dịch vụ
            </a>{' '}
            và xác nhận rằng bạn đã đọc{' '}
            <a href="#" className="text-emerald-500 underline hover:text-emerald-600">
              Chính sách quyền riêng tư
            </a>{' '}
            của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlanModal;