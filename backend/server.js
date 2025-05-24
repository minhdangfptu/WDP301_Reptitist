const express = require('express');
const { connect } = require('mongoose');
const router = require('./src/routes/index.js');
const dotenv = require('dotenv');
const morgan = require('morgan');
var cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./src/config/db.js');

const app = express();
dotenv.config();

// CORS configuration - QUAN TRỌNG!
const corsOptions = {
  origin: [
    'http://localhost:3000', // React development server
    'http://localhost:5173', // Vite development server  
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(morgan('dev'));

//Connection to MongoDB
connectDB();

// For parsing application/json
app.use(express.json());
app.use(bodyParser.json());

app.use('/reptitist', router);

router.get("/test", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.listen(process.env.PORT, () => {
  console.log(`server is running at http://localhost:${process.env.PORT}`);
});