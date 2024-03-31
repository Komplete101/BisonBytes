const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const config = require('./config');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ProjectIPDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// JWT authentication middleware
app.use((req, res, next) => {
  // Check for token in request header
  const token = req.headers['authorization'];

  // Verify token
  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token is not valid' });
      } else {
        req.username = decoded.username;
        next();
      }
    });
  } else {
    res.status(401).json({ message: 'Authorization token is not provided' });
  }
});

// Routes
app.use('/api', require('./routes/api'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
