const Product = require('../models/Products');

const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_price,
      user_id,
      product_description,
      product_images,
      product_category_id,
      product_quantity
    } = req.body;


    const product = new Product({
      product_name,
      product_price,
      user_id,
      product_description,
      product_images,
      product_category_id,
      product_quantity
    });

    await product.save();

    res.status(201).json({ message: 'Product created successfully!', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create product!',
      error: error.message
    });
  }
};

const getAllProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ product_category_id: categoryId });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this category' });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch products!',
      error: error.message
    });
  }
}

const getAllProductByName = async (req, res) => {
  try {
    const { productName } = req.params;
    const products = await Product.find({ product_name: { $regex: productName, $options: 'i' } }); //ignore any case
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found with this name' });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch products!',
      error: error.message
    });
  }
}

const getAllProductRecentUploaded = async (req, res) => {
  try {
    const products = await Product.find().sort({ create_at: -1 }).limit(10);
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No recent products found' });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch recent products!',
      error: error.message
    });
  }
}

const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch product details!',
      error: error.message
    });
  }
}

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete product!',
      error: error.message
    });
  }
}

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updatedData = req.body;

    const product = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully!', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update product!',
      error: error.message
    });
  }
}

const createFeedbackAndRating = async (req, res) => {
  try {
    const { productId, userId, feedback, rating } = req.body;

    const feedbackData = {
      feedback,
      rating,
      user_id: userId
    };

    const product = await Product.findByIdAndUpdate(
      productId,
      { $push: { feedback: feedbackData } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Feedback and rating created successfully!', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create feedback and rating!',
      error: error.message
    });
  }
}
const viewFeedbackAndRating = async (req, res) => {
  
}
module.exports = { createProduct, getAllProductsByCategory, getAllProductByName, getAllProductRecentUploaded, getProductDetails, deleteProduct , updateProduct};
