const express = require('express');
const router = express.Router();
const reptileRoutes = require('./reptile');


// const carRoutes = require("./carRoutes.js")
// const userRoutes = require("./userRoutes.js")
// const bookingRoutes = require("./bookingRoutes.js")
// const feedbackRoutes = require("./feedbackRoutes.js")
// const transactionRoutes = require("./transactionRoutes.js")
router.use('/reptiles', reptileRoutes);
// router.use('/cars', carRoutes)
// router.use("/users", userRoutes)
// router.use("/bookings", bookingRoutes)
// router.use("/feedbacks", feedbackRoutes)
// router.use("/transactions", transactionRoutes)

module.exports= router;