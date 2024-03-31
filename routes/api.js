const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');

// Example route
router.get('/example', (req, res) => {
  res.json({ message: 'Example route' });
});

// Login route
router.post('/login', (req, res) => {
  // Validate user credentials
  const { username, password } = req.body;

  // Example validation, replace with your actual authentication logic
  if (username === 'manager' && password === 'managerpassword') {
    const token = jwt.sign({ username }, config.secret, { expiresIn: '1h' });
    res.json({ token });
  } else if (username === 'basic' && password === 'basicpassword') {
    const token = jwt.sign({ username }, config.secret, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

module.exports = router;
