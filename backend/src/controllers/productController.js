const Product = require('../models/Products'); 

const createProduct = async (req, res) => {
  try {
    const {
      product_id,
      product_name,
      product_price,
      user_id,
      product_description,
      product_images,
      product_category_id,
      product_quantity
    } = req.body;

    
    const idExists = await Product.findOne({ product_id });
    if (idExists) {
      return res.status(400).json({ message: 'Product ID already exists' });
    }

    
    const product = new Product({
      product_id,
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
module.exports = { createProduct, getAllProductsByCategory };
