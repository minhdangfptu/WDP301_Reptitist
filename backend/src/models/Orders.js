const mongoose = require('mongoose');


const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',  
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
}, { _id: false });  


const orderSchema = new mongoose.Schema({
  order_items: {
    type: [orderItemSchema], 
    required: true
  },
  order_status: {
    type: String,
    enum: ['ordered', 'shipped', 'delivered', 'cancelled', 'completed'],
    default: 'ordered'
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  order_price: {
    type: Number,
    required: true
  },
  delivery_info: {
    fullName: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    delivery_address: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ''
    }
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  collection: 'orders'
});

module.exports = mongoose.model('Order', orderSchema);
console.log('Order model loaded');