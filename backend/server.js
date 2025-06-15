const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const { connect } = require('mongoose');
const router = require('./src/routes');
const morgan = require('morgan');
var cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./src/config/db.js');

const app = express();
const passport = require('passport');

// CORS configuration - QUAN TRỌNG!
const corsOptions = {
  origin: [
    'http://localhost:3000', // React development server
    'http://localhost:5173', // Vite development server  
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://reptitist-service.vercel.app',
    
  ],
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
console.log(""),
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(morgan('dev'));

//Connection to MongoDB
connectDB();

// For parsing application/json - Increase limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// For parsing application/x-www-form-urlencoded - Increase limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/reptitist', router);

router.get("/test", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.listen(process.env.PORT, () => {
  console.log(`server is running at http://localhost:${process.env.PORT}`);
});