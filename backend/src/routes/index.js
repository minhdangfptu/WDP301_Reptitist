const express= require('express');
const router =express.Router();
const authRoute=require('./authRoute.js')
const shopRoute=require('./shopRoute.js')
const userReptileRoutes = require('./userReptileRoute.js');
const reptileInfoRoute = require('./reptileInfoRoute.js');
const aiRoute = require('./aiRoute.js');
const libraryCategoriesRoute = require('./libraryCategoriesRoute');
const libraryContentRoute = require('./libraryContentRoute');
const topicCategoryRoutes = require('./topicCategoryRoutes');
const transactionRoute = require('./transactionRoute.js');
const orderRoute = require('./orderRoute');
const adminRoute = require('./adminRoute'); 
const userRoute = require('./userRoute');
const productReportRoute = require('./productReportRoute');

router.use('/user', userRoute);
router.use('/auth',authRoute);
router.use('/shop',shopRoute);
router.use('/pet', userReptileRoutes);
router.use('/reptile-info', reptileInfoRoute);
router.use('/order', orderRoute);
router.use('/admin', adminRoute);
router.use('/ai', aiRoute);
router.use('/library-categories', libraryCategoriesRoute);
router.use('/library-content', libraryContentRoute);
router.use('/topic-categories', topicCategoryRoutes);
router.use('/transactions', transactionRoute);
router.use('/product-reports', productReportRoute);

module.exports= router;