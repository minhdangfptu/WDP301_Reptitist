const Order = require('../models/Orders');
const Product = require('../models/Products');
const Cart = require('../models/Carts');
const { successResponse } = require('../../utils/APIResponse');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  try {
    const { order_items, delivery_info } = req.body;

    if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({ message: 'order_items must be a non-empty array' });
    }
    if (!delivery_info || typeof delivery_info !== 'object') {
      return res.status(400).json({ message: 'delivery_info must be an object' });
    }

    const createdOrders = [];

    for (const item of order_items) {
      const product = await Product.findById(item.product_id);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product_id}` });
      }

      if (product.product_quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for: ${product.product_name}` });
      }

      const user_id = req.user._id;
      const cart = await Cart.findOne({ user_id });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found for user' });
      }
      const index = cart.cart_items.findIndex(
        (cartItem) => cartItem.product_id.toString() === item.product_id
      );

      if (index !== -1) {
        if (cart.cart_items[index].quantity > item.quantity) {
          cart.cart_items[index].quantity -= item.quantity;
          cart.cart_items[index].subtotal = cart.cart_items[index].price * cart.cart_items[index].quantity;
        } else {
          cart.cart_items.splice(index, 1);
        }

        await cart.save();
      }

      const itemPrice = product.product_price * item.quantity;

      const newOrder = new Order({
        order_items: [ 
          {
            product_id: product._id,
            product_name: product.product_name,
            product_price: product.product_price,
            quantity: item.quantity,
          }
        ],
        order_price: itemPrice,
        order_status: 'ordered',
        delivery_info,
        customer_id: req.user._id,
        shop_id: product.user_id
      });

      const savedOrder = await newOrder.save();
      createdOrders.push(savedOrder);

      // Trừ tồn kho khi tạo đơn hàng
      product.product_quantity -= item.quantity;
      await product.save();

      console.log(`✅ Stock deducted for ${product.product_name}: ${item.quantity} units. Remaining: ${product.product_quantity}`);
    }

    res.status(201).json({
      message: 'Orders created successfully',
      orders: createdOrders
    });

  } catch (err) {
    console.error('Create Order Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllOrderByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ customer_id: userId, is_deleted: false })
      .populate('order_items.product_id', 'product_name product_price')
      .populate('shop_id', 'username email')
      .sort({ createdAt: -1 });

    res.json(successResponse(orders));
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Missing id query parameter' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }
    const userId = req.user._id;
    const order = await Order.findOne({ _id: id, customer_id: userId })
      .populate('order_items.product_id', 'product_name product_price')
      .populate('shop_id', 'username email');
    if (!order) {
      return res.status(200).json({ message: 'Order not found', data: [] });
    }
    res.json(successResponse(order));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ FIXED: Hàm updateOrderStatus - Khách hàng cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id, status } = req.query;

    console.log(`🔄 Customer updating order status: ${id} -> ${status}`);

    if (!id || !status) {
      return res.status(400).json({ message: 'Missing id or status parameter' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findOne({ _id: id, customer_id: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }

    const currentStatus = order.order_status;
    console.log(`📋 Current order status: ${currentStatus}`);

    // ✅ FIXED: Cập nhật logic chuyển trạng thái đầy đủ
    const validTransitions = {
      ordered: ['cancelled'],                    // Từ "đang xử lý" → hủy đơn
      shipped: ['completed', 'delivered'],      // Từ "đã gửi" → hoàn thành hoặc đã giao
      delivered: ['completed'],                 // Từ "đã giao" → hoàn thành  
      completed: [],                            // Đã hoàn thành - không thể chuyển
      cancelled: []                             // Đã hủy - không thể chuyển
    };

    // Kiểm tra transition có hợp lệ không
    if (!validTransitions[currentStatus]) {
      console.log(`❌ Unknown current status: ${currentStatus}`);
      return res.status(400).json({
        message: `Unknown order status: ${currentStatus}`
      });
    }

    if (!validTransitions[currentStatus].includes(status)) {
      console.log(`❌ Invalid transition: ${currentStatus} -> ${status}`);
      console.log(`✅ Valid transitions from ${currentStatus}:`, validTransitions[currentStatus]);
      
      return res.status(400).json({
        message: `Cannot change status from '${currentStatus}' to '${status}'. Valid transitions: ${validTransitions[currentStatus].length > 0 ? validTransitions[currentStatus].join(', ') : 'none'}`
      });
    }
    
    // ✅ Xử lý hoàn kho khi khách hàng hủy đơn
    if (currentStatus === 'ordered' && status === 'cancelled') {
      console.log(`🔄 Customer cancelling order ${id}, restoring stock...`);
      
      for (const item of order.order_items) {
        const product = await Product.findById(item.product_id);
        if (product) {
          const oldQuantity = product.product_quantity;
          product.product_quantity += item.quantity;
          await product.save();
          
          console.log(`✅ Stock restored for ${product.product_name}: +${item.quantity} units. New quantity: ${product.product_quantity} (was: ${oldQuantity})`);
        } else {
          console.warn(`⚠️ Product not found for restoring stock: ${item.product_id}`);
        }
      }
    }

    // ✅ Cập nhật trạng thái đơn hàng
    const oldStatus = order.order_status;
    order.order_status = status;
    await order.save();

    console.log(`✅ Order ${id} status updated: ${oldStatus} → ${status}`);

    // ✅ Tạo message phù hợp
    let message;
    switch (status) {
      case 'cancelled':
        message = currentStatus === 'ordered' 
          ? 'Đơn hàng đã được hủy và kho hàng đã được hoàn lại'
          : 'Đơn hàng đã được hủy';
        break;
      case 'completed':
        message = 'Đơn hàng đã được xác nhận hoàn thành';
        break;
      case 'delivered':
        message = 'Đơn hàng đã được đánh dấu là đã giao';
        break;
      default:
        message = `Trạng thái đơn hàng đã được cập nhật thành '${status}'`;
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        order,
        oldStatus,
        newStatus: status
      }
    });

  } catch (error) {
    console.error('❌ Update Order Status Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái đơn hàng',
      error: error.message 
    });
  }
};

exports.getAllOrdersByShop = async (req, res) => {
  try {
    const shopId = req.user._id;

    const orders = await Order.find({ shop_id: shopId, is_deleted: false })
      .populate('order_items.product_id', 'product_name product_price product_imageurl')
      .populate('customer_id', 'username email') 
      .sort({ createdAt: -1 });

    console.log(orders);

    res.status(200).json(successResponse(orders));
  } catch (err) {
    console.error('Error fetching orders by shop:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ FIXED: markOrderAsShippedByShop - Loại bỏ logic trừ kho
exports.markOrderAsShippedByShop = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Missing id query parameter' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const order = await Order.findOne({ _id: id, shop_id: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    if (order.order_status !== 'ordered') {
      return res.status(400).json({ message: 'Only orders in "ordered" status can be marked as shipped' });
    }

    console.log(`📦 Marking order ${id} as shipped (no stock changes)`);

    // Chỉ cập nhật trạng thái - không thay đổi kho
    order.order_status = 'shipped';
    await order.save();

    res.status(200).json(successResponse({
      message: 'Order marked as shipped successfully',
      order
    }));
  } catch (err) {
    console.error('Ship Order Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// XÓA MỀM ĐƠN HÀNG (user chỉ xóa đơn của mình, trạng thái đã hủy hoặc đã giao)
exports.softDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    if (!id) return res.status(400).json({ message: 'Missing order id' });
    const order = await Order.findOne({ _id: id, customer_id: userId });
    if (!order) return res.status(404).json({ message: 'Order not found or not your order' });
    if (order.is_deleted) return res.status(400).json({ message: 'Order already deleted' });
    if (!["cancelled", "delivered", "completed"].includes(order.order_status)) {
      return res.status(400).json({ message: 'Chỉ được xóa đơn đã hủy, đã giao hoặc đã hoàn thành' });
    }
    order.is_deleted = true;
    await order.save();
    res.status(200).json(successResponse({ message: 'Đã xóa đơn hàng (mềm)', order }));
  } catch (err) {
    console.error('Soft delete order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ ENHANCED: updateOrderStatusByShop - Shop cập nhật trạng thái với logic hoàn kho
exports.updateOrderStatusByShop = async (req, res) => {
  try {
    const { id, status } = req.query;
    
    console.log(`🏪 Shop updating order status: ${id} -> ${status}`);
    
    if (!id || !status) {
      return res.status(400).json({ message: 'Missing id or status parameter' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    const order = await Order.findOne({ _id: id, shop_id: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }

    if (order.order_status === 'shipped' && ['delivered', 'cancelled'].includes(status)) {
      // ✅ NẾU SHOP ĐÁNH DẤU GIAO THẤT BẠI (cancelled), HOÀN LẠI KHO
      if (status === 'cancelled') {
        console.log(`❌ Shop marking order ${id} as failed delivery, restoring stock...`);
        
        for (const item of order.order_items) {
          const product = await Product.findById(item.product_id);
          if (product) {
            const oldQuantity = product.product_quantity;
            product.product_quantity += item.quantity;
            await product.save();
            
            console.log(`✅ Stock restored for ${product.product_name}: +${item.quantity} units. New quantity: ${product.product_quantity} (was: ${oldQuantity})`);
          } else {
            console.warn(`⚠️ Product not found for restoring stock: ${item.product_id}`);
          }
        }
      } else if (status === 'delivered') {
        console.log(`✅ Order ${id} marked as delivered successfully`);
      }

      order.order_status = status;
      await order.save();
      
      const message = status === 'cancelled' 
        ? 'Order marked as failed delivery and stock restored successfully'
        : `Order status updated to '${status}' successfully`;
      
      res.status(200).json(successResponse({ 
        message, 
        order 
      }));
    } else {
      res.status(400).json({ 
        message: `Cannot change status from '${order.order_status}' to '${status}'. Only shipped orders can be updated to delivered/cancelled.`
      });
    }
  } catch (error) {
    console.error('Update Order Status By Shop Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ THÊM: Route debug để kiểm tra trạng thái đơn hàng
exports.debugOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, customer_id: req.user._id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const validTransitions = {
      ordered: ['cancelled'],
      shipped: ['completed', 'delivered'],
      delivered: ['completed'],
      completed: [],
      cancelled: []
    };

    res.json({
      orderId: order._id,
      currentStatus: order.order_status,
      validTransitions: validTransitions[order.order_status] || [],
      canComplete: validTransitions[order.order_status]?.includes('completed') || false,
      canCancel: validTransitions[order.order_status]?.includes('cancelled') || false,
      orderDetails: {
        order_date: order.order_date,
        order_price: order.order_price,
        customer_id: order.customer_id,
        shop_id: order.shop_id,
        created_at: order.createdAt,
        updated_at: order.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};