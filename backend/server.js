// crm_server.js
require('dotenv').config({ path: '../../.env' }); //load .enc file from its location
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

const PORT = process.env.REACT_APP_CRM_SERVER_PORT;

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

// 1) DB Connection
const pool = mysql.createPool({
  host: process.env.REACT_APP_DB_HOST,
  user: process.env.REACT_APP_DB_USER,
  password: process.env.REACT_APP_DB_PASSWORD,
  database: process.env.REACT_APP_DB_NAME,
  port: process.env.REACT_APP_DB_PORT,
  waitForConnections: true,
  connectionLimit: 10
});

// Test connection using async/await
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('Connected to MySQL Database (Pool)');
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
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      res.status(200).json({ crm_status: 'OK', database: 'Connected' });
  } catch (err) {
      res.status(500).json({ status: 'Database unreachable', error: err.message });
  }
});



// ================ START SERVER ================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
