const express= require('express');

const authRoute=require('./authRoute.js')
const shopRoute=require('./shopRoute.js')
const router =express.Router();

router.use('/auth',authRoute);
router.use('/shop',shopRoute);

module.exports= router;