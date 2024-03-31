const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const config = require('./config');
const bcrypt = require('bcrypt');
const app = express();


app.use(express.json())


// Encryption (bcrypt example)
const saltRounds = 10;
const plainPassword = 'secret123';
bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});

// Authentication and Authorization (JWT example)
app.post('/login', (req, res) => {
  // Example authentication logic
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username }, config.secret, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

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

// Access Control (middleware example)
const checkUserRole = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  };
  
  app.get('/admin-dashboard', checkUserRole, (req, res) => {
    res.json({ message: 'Welcome to admin dashboard' });
  });
  
  // Secure Coding Practices (preventing SQL injection example)
  app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) {
        console.error('SQL error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json(result);
    });
  });
  
  // Logging (middleware example)
  const logRequests = (req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
  };
  
  app.use(logRequests);
  
  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
// Routes
app.use('/api', require('./routes/api'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



