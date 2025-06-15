const express= require('express');
const router =express.Router();
const authRoute=require('./authRoute.js')
const shopRoute=require('./shopRoute.js')
const adminRoute=require('./adminRouter.js')
const userReptileRoutes = require('./userReptileRoute.js');
const reptileInfoRoute = require('./reptileInfoRoute.js');
const aiRoute = require('./aiRoute.js');
const libraryCategoriesRoute = require('./libraryCategoriesRoute');
const libraryContentRoute = require('./libraryContentRoute');
const topicCategoryRoutes = require('./topicCategoryRoutes');

const orderRoute = require('./orderRoute');
const adminRoute = require('./adminRoute'); // Uncomment if you have admin routes

router.use('/auth',authRoute);
router.use('/shop',shopRoute);
router.use('/info', reptileRoutes);
router.use('/library_categories', libraryCategoriesRoute);
router.use('/library_contents', libraryContentRoute);
router.use('/', topicCategoryRoutes);
router.use('/order', orderRoute);
router.use('/admin', adminRoute);

module.exports= router;