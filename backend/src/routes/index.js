const express= require('express');
const router =express.Router();
const authRoute=require('./authRoute.js')
const shopRoute=require('./shopRoute.js')
const reptileRoutes = require('./reptile');
const libraryCategoriesRoute = require('./libraryCategoriesRoute');

router.use('/auth',authRoute);
router.use('/shop',shopRoute);
router.use('/info', reptileRoutes);
router.use('/library_categories', libraryCategoriesRoute);
module.exports= router;