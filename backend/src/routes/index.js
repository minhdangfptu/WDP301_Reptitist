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

router.use('/auth',authRoute);
router.use('/shop',shopRoute);
router.use('/pet', userReptileRoutes);
router.use('/lore', reptileInfoRoute);
router.use('/library_categories', libraryCategoriesRoute);
router.use('/library_contents', libraryContentRoute);
router.use('/', topicCategoryRoutes);
router.use('/ai', aiRoute);
router.use('/reptitist', topicCategoryRoutes);
router.use('/admin', adminRoute); 

module.exports= router;