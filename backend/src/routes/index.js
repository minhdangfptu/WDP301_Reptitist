const express= require('express');
const router =express.Router();
const authRoute=require('./authRoute.js')
const shopRoute=require('./shopRoute.js')
const reptileRoutes = require('./reptile');
const libraryCategoriesRoute = require('./libraryCategoriesRoute');
const libraryContentRoute = require('./libraryContentRoute');
const topicCategoryRoutes = require('./topicCategoryRoutes');

const orderRoute = require('./orderRoute');

router.use('/auth',authRoute);
router.use('/shop',shopRoute);
router.use('/info', reptileRoutes);
router.use('/library_categories', libraryCategoriesRoute);
router.use('/library_contents', libraryContentRoute);
router.use('/', topicCategoryRoutes);
router.use('/order', orderRoute);
module.exports= router;