const express= require('express');
const router =express.Router();
const authRoute=require('./authRoute.js')
const shopRoute=require('./shopRoute.js')
const reptileRoutes = require('./reptile');
const libraryCategoriesRoute = require('./libraryCategoriesRoute');
const libraryContentRoute = require('./libraryContentRoute');
const topicCategoryRoutes = require('./topicCategoryRoutes');
const adminRoute = require('./adminRouter.js'); 

router.use('/auth',authRoute);
router.use('/shop',shopRoute);
router.use('/reptile', reptileRoutes);
router.use('/library_categories', libraryCategoriesRoute);
router.use('/library_contents', libraryContentRoute);
router.use('/reptitist', topicCategoryRoutes);
router.use('/admin', adminRoute); 

module.exports= router;