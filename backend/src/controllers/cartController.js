const Cart = require('../models/Carts');
const Product = require('../models/Products');

const addProductToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.userId; // Lấy user_id từ JWT

    if (!product_id || quantity === undefined) {
      return res.status(400).json({ message: 'Missing required fields: product_id or quantity' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const price = product.product_price;

    // Tìm hoặc tạo giỏ hàng cho người dùng
    let cart = await Cart.findOne({ user_id });

    if (!cart) {
      cart = new Cart({
        user_id,
        cart_items: []
      });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.cart_items.findIndex(item => item.product_id.toString() === product_id);

    if (existingItemIndex > -1) {
      // Nếu sản phẩm đã có, cập nhật số lượng
      const newQuantity = cart.cart_items[existingItemIndex].quantity + quantity;
      
      // Nếu số lượng mới <= 0, xóa sản phẩm khỏi giỏ hàng
      if (newQuantity <= 0) {
        cart.cart_items.splice(existingItemIndex, 1);
      } else {
        // Cập nhật số lượng và giá
        cart.cart_items[existingItemIndex].quantity = newQuantity;
        cart.cart_items[existingItemIndex].price = price;
        cart.cart_items[existingItemIndex].subtotal = price * newQuantity;
      }
    } else {
      // Nếu sản phẩm chưa có và số lượng > 0, thêm mới vào giỏ hàng
      if (quantity > 0) {
        const subtotal = price * quantity;
        cart.cart_items.push({ product_id, quantity, price, subtotal });
      }
    }

    await cart.save();

    res.status(200).json({ message: 'Cart updated successfully!', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const user_id = req.userId;
    const cart = await Cart.findOne({ user_id }).populate('cart_items.product_id', 'product_name product_price product_imageurl');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Tính tổng quantity và tổng price
    let total_quantity = 0;
    let total_price = 0;

    const cartItems = cart.cart_items.map(item => {
      const product = item.product_id;
      const quantity = item.quantity;
      const price = item.price;
      const subtotal = item.subtotal ?? price * quantity;

      total_quantity += quantity;
      total_price += subtotal;

      return {
        product_id: product._id,
        product_name: product.product_name,
        product_image: product.product_imageurl,
        quantity,
        price,
        subtotal,
        _id: item._id
      };
    });

    return res.status(200).json({
      message: 'Cart fetched successfully',
      cart: {
        user_id,
        cart_items: cartItems,
        total_quantity,
        total_price,
        updated_at: cart.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

const deleteProductFromCart = async (req, res) => {
    try{
        const user_id = req.userId;
        const cartItemId = req.params.cartItemId;
        const cart = await Cart.findOne({user_id});
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const index = cart.cart_items.findIndex(item => item._id.toString() === cartItemId);
        if (index === -1) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        cart.cart_items.splice(index, 1);
        await cart.save();

        return res.status(200).json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete cart item', error: error.message });

    }
};

const deleteAllProductFromCart = async (req, res) => {
    try{
        const user_id = req.userId;
        const cart = await Cart.findOne({user_id});
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.cart_items = [];
        await cart.save();

        return res.status(200).json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete cart item', error: error.message });
    }
}
const countCartItems = async (req, res) => {
  try {
    const user_id = req.userId;
    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const totalQuantity = cart.cart_items.reduce((total, item) => total + item.quantity, 0);
    return res.status(200).json({ totalQuantity });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch cart count', error: error.message });
  }
};
module.exports = {
  addProductToCart,
  getCart,
  deleteProductFromCart,
  deleteAllProductFromCart,
  countCartItems
};