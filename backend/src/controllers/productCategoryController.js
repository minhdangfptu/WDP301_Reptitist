const ProductCategory = require('../models/Products_categories');

const createCategory = async (req, res) => {
    try {
        const {product_category_name, product_category_imageurl } = req.body;

        const nameExists = await ProductCategory.findOne({ product_category_name });
        if (nameExists) {
            return res.status(400).json({ message: 'Product category name already exists' });
        }


        const category = new ProductCategory({
            product_category_name,
            product_category_imageurl
        });

        await category.save();

        res.status(201).json({ message: 'Product category created successfully!', 'Created category': category });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to create product category!',
            error: error.message
        });
    }
}
const getAllCategories = async (req, res) => {
    try {
        const categories = await ProductCategory.find();
        res.status(200).json(categories);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to fetch product categories!',
            error: error.message
        });
    }
}
const getCategoriesById = async (req, res) => {
    try {
        
        const { categoryId } = req.params;
        const category = await ProductCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Product category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to fetch product category!',
            error: error.message
        });
    }
}
const editCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { product_category_name, product_category_imageurl } = req.body;

        const category = await ProductCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Product category not found' });
        }
        const nameExists = await ProductCategory.findOne({ product_category_name });
        if (nameExists) {
            return res.status(400).json({ message: 'Product category name already exists' });
        }
        if (product_category_imageurl) {
            category.product_category_imageurl = product_category_imageurl;
        }
        category.product_category_name = product_category_name;
        await category.save();
        res.status(200).json({ message: 'Product category updated successfully!', 'Updated category': category });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to update product category!',
            error: error.message
        });
    }
}
const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await ProductCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Product category not found' });
        }
        await category.deleteOne();
        res.status(200).json({ message: 'Product category deleted successfully!', 'Deleted category': category  });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Failed to delete product category!',
            error: error.message
        });
    }
}

module.exports = {
    createCategory,
    getAllCategories,
    getCategoriesById,
    editCategory,
    deleteCategory
};
