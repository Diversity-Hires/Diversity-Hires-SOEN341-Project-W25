// crm_server.js
require('dotenv').config({ path: '../../.env' }); //load .enc file from its location
const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');

// initialize firebase admin SDK
const serviceAccount = require('/Users/moses/Desktop/SOEN 341/Diversity-Hires-SOEN341-Project-W25/backend/ChatHaven Firebase Admin SDK.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore Database reference 
const app = express();

const PORT = process.env.REACT_APP_CRM_SERVER_PORT;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  //print incoming requests for debugging
  console.log(`Incoming request: ${req.method} ${req.path}`);
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

// Auth Middleware (JWT)
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


// CRM Health Check Endpoint - Check if CRM server is running for Firebase
app.get('/api/health', async (req, res) => {
  try {
      await db.collection('healthCheck').doc('status').set({ status: 'OK',timestamp: new Date()

      })
      res.status(200).json({ crm_status: 'OK', database: 'Connected' });
  } catch (err) {
      res.status(500).json({ status: 'Database unreachable', error: err.message });
  }
});



// Login
app.post('/api/auth/login', apiKeyMiddleware, async (req, res) => {
  const { email, password } = req.body;
  try {
   const userRef = db.colllection('users').doc(email);
   const userDoc = await userRef.get();
   if (!userDoc.exists){
      return res.status(401).json({ success: false, message: 'Invalid credentials: user not found' });
    }

    const user = userDoc.data();
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.error('Failed CRM login attempt detected');
      return res.status(401).json({ success: false, message: 'Invalid credentials: incorrect password' });
    }
  
    // Handle successful login
    console.warn("Successful CRM login")
    // Generate token
    const token = jwt.sign({ id: email }, process.env.REACT_APP_JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});


// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if user exists
    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();

    if (userDoc.exists){
      return res.status(400).json({ success: false, message: 'Email is already in use' });
    }

    //Hash Password

    const hashedPassword = await bcrypt.hash(password, 10); 

    await userRef.set({
      email,
      password:hashedPassword,
      createdAt: adminf.irestore.FieldValue.serverTimestamp(),
    })
    return res.json({ message : 'User regesitered successfully.'});
  }
    catch (error){
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Server error.' });
    }
});

// Get all users

app.get('/api/users/:email', async (req, res) => {
  try {
    const userSnapshot = await db.collection('users').get();
    const users = userSnapshot.docs.map(doc => ({id : DiagnosticCategory.id, ...doc.data()}));
    res.json(users);
  }
  catch (error){
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Get a single user

app.get('/api/users/:email', async (req, res) => {
  try {
    const userRef = db.collection ('users').doc(req.params.email);
    const userDoc = await userRef.get();

    if (!userDoc.exists){
      return res.status(404).json({message : 'User not found'});
    }
    res.json(userDoc.data());
  }
  catch (error){
    console.error('GError fetching user:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Delete a user
app.delete('/api/users/:email', async (req, res) => {
  try {
    const userRef = db.collection("users").doc(req.params.email);
    await userRef.delete();
    res.json({message: 'User deleted successfully'});
  }
  catch (error){
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});


// ================ START SERVER ================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
