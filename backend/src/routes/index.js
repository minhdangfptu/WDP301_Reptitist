const express = require('express');
const router = express.Router();
// const carRoutes = require("./carRoutes.js")
// const userRoutes = require("./userRoutes.js")
// const bookingRoutes = require("./bookingRoutes.js")
// const feedbackRoutes = require("./feedbackRoutes.js")
// const transactionRoutes = require("./transactionRoutes.js")

=======
const authRoute=require('./authRoute.js')
const shopRoute=require('./shopRoute.js')
const reptileRoutes = require('./reptile');
const libraryCategoriesRoute = require('./libraryCategoriesRoute');
const router =express.Router();

router.use('/auth',authRoute);
router.use('/shop',shopRoute);
router.use('/info', reptileRoutes);
router.use('/library_categories', libraryCategoriesRoute);
>>>>>>> Stashed changes
module.exports= router;