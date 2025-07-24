const Order = require('../models/Orders');
const Product = require('../models/Products');
const Cart = require('../models/Carts');
const { successResponse } = require('../../utils/APIResponse');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  try {
    const { order_items } = req.body;

    if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({ message: 'order_items must be a non-empty array' });
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
        order_items: [ // order_items vẫn là array, nhưng chỉ chứa 1 sản phẩm
          {
            product_id: product._id,
            product_name: product.product_name,
            product_price: product.product_price,
            quantity: item.quantity,
          }
        ],
        order_price: itemPrice,
        order_status: 'ordered',
        customer_id: req.user._id,
        shop_id: product.user_id
      });

      const savedOrder = await newOrder.save();
      createdOrders.push(savedOrder);

      // Trừ tồn kho
      product.product_quantity -= item.quantity;
      await product.save();
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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id, status } = req.query;

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

    //Chỉ cho phép chuyển theo quy tắc:
    const validTransitions = {
      ordered: ['cancelled'],
      shipped: ['completed','delivered']
    };

    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from '${currentStatus}' to '${status}'`
      });
    }

    order.order_status = status;
    await order.save();

    res.status(200).json(successResponse({ message: `Order status updated to '${status}'`, order }));
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllOrdersByShop = async (req, res) => {
  try {
    const shopId = req.user._id;

    const orders = await Order.find({ shop_id: shopId, is_deleted: false })
      .populate('order_items.product_id', 'product_name product_price product_imageurl')
      .populate('customer_id', 'username email') 
      .sort({ createdAt: -1 });

    res.status(200).json(successResponse(orders));
  } catch (err) {
    console.error('Error fetching orders by shop:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

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

    for (const item of order.order_items) {
      const product = await Product.findById(item.product_id);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product_id}` });
      }

      if (product.product_quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for: ${product.product_name}` });
      }

      product.product_quantity -= item.quantity;
      await product.save();
    }

    order.order_status = 'shipped';
    await order.save();

    res.status(200).json(successResponse({
      message: 'Order marked as shipped and product stock updated',
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
    if (!["cancelled", "delivered"].includes(order.order_status)) {
      return res.status(400).json({ message: 'Chỉ được xóa đơn đã hủy hoặc đã giao' });
    }
    order.is_deleted = true;
    await order.save();
    res.status(200).json(successResponse({ message: 'Đã xóa đơn hàng (mềm)', order }));
  } catch (err) {
    console.error('Soft delete order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateOrderStatusByShop = async (req, res) => {
  try {
    const { id, status } = req.query;
    
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
      order.order_status = status;
      await order.save();
      
      res.status(200).json(successResponse({ 
        message: `Order status updated to '${status}'`, 
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