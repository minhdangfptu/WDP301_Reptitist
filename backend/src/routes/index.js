const express= require('express');

const authRoute=require('./authRoute.js')
const shopRoute=require('./shopRoute.js')
const reptileRoutes = require('./reptile');
const aiRoute = require('./aiRoute.js');
const router =express.Router();

router.use('/auth',authRoute);
router.use('/shop',shopRoute);
router.use('/info', reptileRoutes);
router.use('/ai', aiRoute);

module.exports= router;