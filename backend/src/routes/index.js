const express= require('express');

const authRoute=require('./authRoute.js')
const router =express.Router();

router.use('/auth',authRoute);

module.exports= router;