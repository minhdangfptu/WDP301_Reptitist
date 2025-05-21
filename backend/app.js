const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const router=require('./src/routes/index');



const app = express();
const allRoutes = require('./src/routes');  
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api', allRoutes);
// Connect to MongoDB
connectDB();

// Routes
app.use('/', router);


module.exports = app;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));