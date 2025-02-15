// server.js
require('dotenv').config({ path: '../.env' }); //load .enc file from its location
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

const PORT = process.env.REACT_APP_SERVER_PORT;


// Firebase Admin Configuration - Uses Service Account for beck-end access to Firebase services
const admin = require("firebase-admin");

const serviceAccount = require("./chathaven-3b77a-firebase-adminsdk-fbsvc-a07b73f8ff.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chathaven-3b77a-default-rtdb.firebaseio.com"
});

// For Firestore:
// const db = admin.firestore();
// For Realtime Database:
const db = admin.database();



// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  //print incoming requests for debugging
  console.log(`Incoming request: ${req.method} ${req.path}  Name: ${req.body.firstName}`);
  next();
});


// API Key Middleware (For Specific Routes)
function apiKeyMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.REACT_APP_API_KEY) {
      console.warn(`Unauthorized access attempt detected.`);
      return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
  }
  next();
}


// Test connection using async/await
(async () => {
  try {
    const snapshot = await db.ref('healthCheck').once('value');
    console.log('Connected to Firebase Database');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
})();


// 2) Auth Middleware (JWT)
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing.' });
  }
  jwt.verify(token, process.env.REACT_APP_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    req.userId = decoded.id;
    next();
  });
}


// CRM Health Check Endpoint - adapted for mysql2/promise
app.get('/api/health', async (req, res) => {
  try {
      // We'll just do a quick read from a root node or a test node
      // If we get any data or even null, it means DB is accessible
      const snapshot = await db.ref('healthCheck').once('value');
      res.status(200).json({ status: 'OK', database: 'Connected', data: snapshot.val() || null});
  } catch (err) {
      res.status(500).json({ status: 'Database unreachable', error: err.message });
  }
});



// Login
app.post('/api/auth/login', apiKeyMiddleware, async (req, res) => {
  const { username, password } = req.body;
  try {
    // Search for a user by username
    const userSnapshot = await db.ref('users').child(username).once('value');
    const userData = userSnapshot.val();

    if (!userData) {
      return res.status(401).json({ success: false, message: 'Invalid credentials: user not found' });
    }

    // Compare the hashed password
    const match = await bcrypt.compare(password, userData.password);
    if (!match) {
      console.error('Failed CRM login attempt detected');
      return res.status(401).json({ success: false, message: 'Invalid credentials: incorrect password' });
    }
    // Handle successful login
    console.warn("Successful CRM login")
    // Generate token
    const token = jwt.sign({ id: username }, process.env.REACT_APP_JWT_SECRET, {
      expiresIn: '1d'
    });
    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});



// Register
app.post('/api/auth/register', apiKeyMiddleware, async (req, res) => {
  const { username, password } = req.body;
  try {
    const userSnapshot = await db.ref('users').child(username).once('value');
    if (userSnapshot.exists()) {
      return res.status(400).json({ message: 'Username already in use.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.ref('users').child(username).set({
      password: hashed,
      // other user fields...
    });

    res.json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});



// ================ START SERVER ================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
