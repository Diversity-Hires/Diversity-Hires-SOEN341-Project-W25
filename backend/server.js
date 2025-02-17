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

// Utility function to generate a unique 3-digit server ID
async function generateServerId() {
  let serverId;
  let snapshot;

  do {
    // random integer between 100 and 999
    const randomInt = Math.floor(Math.random() * 900) + 100;
    serverId = randomInt.toString();

    // Check if this ID already exists
    snapshot = await db.ref(`servers/${serverId}`).once('value');
  } while (snapshot.exists());

  return serverId;
}

// Check if user exists
async function checkUser(username) {
  const usersRef = db.ref(`users/${username}`);
  const userSnapshot = await usersRef.once('value');
  return userSnapshot.exists()
}


//Health Check Endpoint - adapted for mysql2/promise
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
    console.warn("Successful login")
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


// Add a new server
app.post('/api/new-server', apiKeyMiddleware, authMiddleware, async (req, res) => {
  try {
    const { serverName, users } = req.body; 
    // serverName: string
    // users: array of usernames (optional)

    if (!serverName) {
      return res.status(400).json({ message: 'serverName is required.' });
    }

    // Step 1: Generate a unique 3-digit server ID
    const serverId = await generateServerId();

    // Step 2: Format of the server Data
    const newServerData = {
      name: serverName,
      channels: {},    // e.g. { general: {...}, etc. }
      users: {},       // map of username -> role
    };

    // The user who created the server is admin
    newServerData.users[req.userId] = 'admin'; 

    // Build an array of users that exis
    const validatedUsers = [];

    // If we have an array of additional users, add them as members
    if (Array.isArray(users)) {
      for (const username of users) {
        // Check if user exists and remove from list if not
        if (await checkUser(username)) { // Ensure await is used inside for...of
          newServerData.users[username] = 'member';
          validatedUsers.push(username);
        }
      }
    }

    // Step 3: Write the new server to /servers/{serverId}
    await db.ref(`servers/${serverId}`).set(newServerData);

    // Step 4: Update each user's server list
    // This includes the creator, so let's build an array of unique usernames
    const userList = new Set([req.userId, ...(validatedUsers || [])]);

    userList.forEach(async (username) => {
      await db
        .ref(`users/${username}/servers/${serverId}`)
        .set(serverName);
    });

    return res.status(201).json({
      message: 'Server created successfully.',
      server: {
        id: serverId,
        name: serverName,
        users: [...userList],
      },
    });
  } catch (error) {
    console.error('Error creating server:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});




// Add a user to a server
app.post('/api/servers/add-user', apiKeyMiddleware, authMiddleware, async (req, res) => {
  try {
    const { serverId, username, role } = req.body; 
    // username: string, role: optional (e.g. "member", "admin", etc.)

    // Validate input
    if (!serverId || !username) {
      return res.status(400).json({ message: 'Missing required fields: serverId or username.' });
    }

    // Check if the server exists
    const serverRef = db.ref(`servers/${serverId}`);
    const serverSnapshot = await serverRef.once('value');
    if (!serverSnapshot.exists()) {
      return res.status(404).json({ message: 'Server not found.' });
    }

    // Check if the username exists
    if(!(await checkUser(username))){
      return res.status(404).json({ message: 'User not found.' });
    }

    // Add or update this user under /servers/<serverName>/users/<username>
    // If no role is provided, default to 'member'
    await serverRef.child('users').child(username).set(role || 'member');

    const serverName = (await serverRef.child('name').once('value')).val(); //get and assign the name of the server in one line

    // Add the server to the list under /users/<username>/servers
    const userServersRef = db.ref(`users/${username}/servers/${serverId}`);
    const userServersSnaphot = await userServersRef.once('value');
    if(!userServersSnaphot.exists()){
      await db
          .ref(`users/${username}/servers/${serverId}`)
          .set(serverName);
    }

    return res.status(200).json({ 
      message: `User "${username}" added to server "${serverName}" successfully!`
    });
  } catch (error) {
    console.error('Error adding user to server:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});



// ================ START SERVER ================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
