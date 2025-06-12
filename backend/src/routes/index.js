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
const transactionRoute = require('./transactionRoute.js');

router.use('/auth',authRoute);
router.use('/shop', shopRoute);
router.use('/user-reptiles', userReptileRoutes);
router.use('/reptile-info', reptileInfoRoute);
router.use('/ai', aiRoute);
router.use('/library-categories', libraryCategoriesRoute);
router.use('/library-content', libraryContentRoute);
router.use('/topic-categories', topicCategoryRoutes);
router.use('/transactions', transactionRoute);
router.use('/admin', adminRoute);

module.exports= router;