const express = require('express');
const { connect } = require('mongoose');
const router = require('./src/routes/index.js');
const dotenv = require('dotenv');
var cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
dotenv.config();
app.use(cors());

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
connect(MONGODB_URI);


// For parsing application/json
//app.use(express.json());
app.use(bodyParser.json());
app.use('/reptitist', router);

router.get("/test", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
