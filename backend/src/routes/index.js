const express= require('express');

const authRoute=require('./authRoute.js')
const shopRoute=require('./shopRoute.js')
const reptileRoutes = require('./reptile');
const router =express.Router();

router.use('/auth',authRoute);
router.use('/shop',shopRoute);
router.use('/info', reptileRoutes);

module.exports= router;