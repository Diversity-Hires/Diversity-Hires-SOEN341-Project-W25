// server.js
require('dotenv').config({ path: '../.env' }); //load .enc file from its location
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');

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
async function generateId(location) {
  let Id;
  let snapshot;

  do {
    // random integer between 100 and 999
    const randomInt = Math.floor(Math.random() * 900) + 100;
    Id = randomInt.toString();

    // Check if this ID already exists
    snapshot = await db.ref(`${location}/${Id}`).once('value');
  } while (snapshot.exists());

  return Id;
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
    const serverId = await generateId("servers");

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



// Add a new DM
app.post('/api/new-dm', apiKeyMiddleware, authMiddleware, async (req, res) => { //FILIP ADDED THIS
  try {
    const {users} = req.body; 
    // users: array of usernames

    // Step 1: Generate a unique 3-digit server ID
    const DmId = await generateId("directmessages");

    // Step 2: Format of the server Data
    const newDMData = {
      users: {},       // map of username -> role
    };

    // Build an array of users that exis
    // The user who created the server is admin
    newDMData.users[req.userId] = 'dm'; 

    // Build an array of users that exist
    const validatedUsers = [];

    // If we have an array of additional users, add them as members
    if (Array.isArray(users)) {
      for (const username of users) {
        // Check if user exists and remove from list if not
        if (await checkUser(username)) { // Ensure await is used inside for...of
          newDMData.users[username] = 'dm';
          validatedUsers.push(username);
        }
      }
    }

    // Step 3: Write the new dm to /directmessages/{DmId}
    await db.ref(`directmessages/${DmId}`).set(newDMData);

    // Step 4: Update each user's server list
    // This includes the creator, so let's build an array of unique usernames
    const userList = new Set([req.userId, ...(validatedUsers || [])]);

    

    return res.status(201).json({
      message: 'DM created successfully.',
      DM: {
        id: DmId,
        users: [...userList],
      },
    });
  } catch (error) {
    console.error('Error creating dm:', error);
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


    return res.status(200).json({ 
      message: `User "${username}" added to server "${serverName}" successfully!`
    });
  } catch (error) {
    console.error('Error adding user to server:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});


// add a user to the welcome server
app.post('/api/servers/welcomeserver', apiKeyMiddleware, async (req, res) => {
  try {
    const {username} = req.body; 
    // username: string, role: optional (e.g. "member", "admin", etc.)

    const serverId = '001';
    const role = 'member';

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


    return res.status(200).json({ 
      message: `User "${username}" added to server "${serverName}" successfully!`
    });
  } catch (error) {
    console.error('Error adding user to server:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Send a message to a server
app.post('/api/servers/messages', apiKeyMiddleware, authMiddleware, async (req, res) => {
  try {
    const { text, serverId } = req.body; // text of the message

    // Validate input
    if (!serverId || !text) {
      return res.status(400).json({ message: 'Missing serverId or text.' });
    }

    // Check if the server exists
    const serverRef = db.ref(`servers/${serverId}`);
    const serverSnapshot = await serverRef.once('value');
    if (!serverSnapshot.exists()) {
      return res.status(404).json({ message: 'Server not found.' });
    }

    // The current user is stored in req.userId by authMiddleware
    const username = req.userId;

    // Check if the user is part of the server
    const userRef = serverRef.child('users').child(username);
    const userSnapshot = await userRef.once('value');
    if (!userSnapshot.exists()) {
      // If the user isn't listed in server's users node, they aren't a member
      return res.status(403).json({ message: 'You are not a member of this server.' });
    }

    const timestamp = Date.now(); // or new Date().toISOString()

    // Push a new message under servers/{serverId}/messages
    const messagesRef = serverRef.child('messages');

    // Generate a unique id for this message
    const newMessageRef = messagesRef.push();

    await newMessageRef.set({
      text,
      username,
      timestamp
    });

    // Return success along with the new message ID
    return res.status(201).json({
      message: 'Message sent successfully!',
      data: {
        id: newMessageRef.key,
        text,
        username,
        timestamp
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});




// Delete a user from a server (admin only)
app.delete('/api/servers/remove-user', apiKeyMiddleware, authMiddleware, async (req, res) => {
  try {
    const { serverId, username } = req.body;
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

    // Check if the user exists in the server's users list
    const userRefInServer = serverRef.child('users').child(username);
    const userSnapshot = await userRefInServer.once('value');
    if (!userSnapshot.exists()) {
      return res.status(404).json({ message: 'User not found in this server.' });
    }

    // Remove the user from the server's users list
    await userRefInServer.remove();

    return res.status(200).json({ 
      message: `User "${username}" removed from server successfully!`
    });
  } catch (error) {
    console.error('Error removing user from server:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});


// Send a message in a private conversation
app.post('/api/dms/messages', apiKeyMiddleware, authMiddleware, async (req, res) => { //FILIP WROTE THIS PART
  try {
    const { text, serverId } = req.body; // text of the message

    // Validate input
    if (!serverId || !text) {
      return res.status(400).json({ message: 'Missing Id or text.' });
    }

    // Check if the server exists
    const DMRef = db.ref(`directmessages/${serverId}`);
    const DMSnapshot = await DMRef.once('value');
    if (!DMSnapshot.exists()) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // The current user is stored in req.userId by authMiddleware
    const username = req.userId;

    // Check if the user is part of the server
    const userRef = DMRef.child('users').child(username);
    const userSnapshot = await userRef.once('value');
    if (!userSnapshot.exists()) {
      // If the user isn't listed in server's users node, they aren't a member
      return res.status(403).json({ message: 'You are not a member of this conversation.' });
    }

    const timestamp = Date.now(); // or new Date().toISOString()

    // Push a new message under servers/{serverId}/messages
    const messagesRef = DMRef.child('messages');
    const newMessageRef = messagesRef.push();

    await newMessageRef.set({
      text,
      username,
      timestamp
    });

    // Return success along with the new message ID
    return res.status(201).json({
      message: 'Message sent successfully!',
      data: {
        id: newMessageRef.key,
        text,
        username,
        timestamp
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});


// Delete a message from a server (author or admin only)
app.delete('/api/servers/messages', apiKeyMiddleware, authMiddleware, async (req, res) => {
  try {
    const { serverId, selectedMessages } = req.body; 
    /*
      Expected req.body:
      {
        "serverId": "123", 
        "selectedMessages": ["-Mabc123", "-Mdef456", ...]
      }
    */

    // Validate input
    if (!serverId || !Array.isArray(selectedMessages) || selectedMessages.length === 0) {
      return res.status(400).json({ message: 'Missing or invalid serverId or messageIds array.' });
    }

    // Check if the server exists
    const serverRef = db.ref(`servers/${serverId}`);
    const serverSnapshot = await serverRef.once('value');
    if (!serverSnapshot.exists()) {
      return res.status(404).json({ message: 'Server not found.' });
    }

    // Track outcomes
    const deleted = [];
    const notFound = [];
    const errors = [];

    // Loop through each messageId
    for (const messageId of selectedMessages) {
      try {
        // Check if the message exists
        const messageRef = serverRef.child('messages').child(messageId);
        const messageSnapshot = await messageRef.once('value');
        if (!messageSnapshot.exists()) {
          notFound.push(messageId);
          continue;
        }

        // Delete the message
        await messageRef.remove();
        deleted.push(messageId);

      } catch (innerErr) {
        console.error(`Error deleting messageId ${messageId}:`, innerErr);
        // Capture this error so we can respond with partial results
        errors.push({ messageId, error: innerErr?.message });
      }
    }

    // Summarize the outcome
    return res.status(200).json({
      message: 'Batch deletion complete.',
      results: {
        deleted,   // array of message IDs successfully deleted
        notFound,  // array of message IDs that did not exist
        errors     // array of { messageId, error } for any exceptions
      }
    });

  } catch (error) {
    console.error('Error deleting messages:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});


// Delete a DM message
app.delete('/api/dms/messages', apiKeyMiddleware, authMiddleware, async (req, res) => { //FILIP WROTE THIS PART
  try {
    const { DmId, selectedMessages } = req.body; 
 
    if (!DmId || !Array.isArray(selectedMessages) || selectedMessages.length === 0) {
      return res.status(400).json({ message: 'Missing or invalid DmId or messageIds array.' });
    }

    // Check if the server exists
    const DmRef = db.ref(`directmessages/${DmId}`);
    const DmSnapshot = await DmRef.once('value');
    if (!DmSnapshot.exists()) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Track outcomes
    const deleted = [];
    const notFound = [];
    const errors = [];

    // Loop through each messageId
    for (const messageId of selectedMessages) {
      try {
        // Check if the message exists
        const messageRef = DmRef.child('messages').child(messageId);
        const messageSnapshot = await messageRef.once('value');
        if (!messageSnapshot.exists()) {
          notFound.push(messageId);
          continue;
        }

        // Delete the message
        await messageRef.remove();
        deleted.push(messageId);

      } catch (innerErr) {
        console.error(`Error deleting messageId ${messageId}:`, innerErr);
        // Capture this error so we can respond with partial results
        errors.push({ messageId, error: innerErr?.message });
      }
    }

    // Summarize the outcome
    return res.status(200).json({
      message: 'Batch deletion complete.',
      results: {
        deleted,   // array of message IDs successfully deleted
        notFound,  // array of message IDs that did not exist
        errors     // array of { messageId, error } for any exceptions
      }
    });

  } catch (error) {
    console.error('Error deleting messages:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});



// Send a request to join a server
app.post('/api/servers/join', apiKeyMiddleware, authMiddleware, async (req, res) => {
  try {
    const { serverId } = req.body;

    // Validate input
    if (!serverId) {
      return res.status(400).json({ message: 'Missing serverId.' });
    }

    // Check if the server exists
    const serverRef = db.ref(`servers/${serverId}`);
    const serverSnapshot = await serverRef.once('value');
    if (!serverSnapshot.exists()) {
      return res.status(404).json({ message: 'Server not found.' });
    }

    // The current user is stored in req.userId by authMiddleware
    const username = req.userId;

    // Check if the user is already part of the server
    const userRef = serverRef.child('users').child(username);
    const userSnapshot = await userRef.once('value');
    if (userSnapshot.exists()) {
      // If the user is listed in server's users node, they are already a member
      return res.status(403).json({ message: 'User is already a member of this server.' });
    }

    const timestamp = Date.now(); // or new Date().toISOString()

    // Check if the user already requested to join
    const requestRef = serverRef.child('requests').child(username);
    const requestSnapshot = await requestRef.once('value');
    if (requestSnapshot.exists()) {
      // If the user is already listed in server's requests node, they already sent a request and it is pending
      return res.status(403).json({ message: 'Request already pending for this user' });
    }


    // Push a new request under servers/{serverId}/requests
    await requestRef.set({
      timestamp
    });

    // Return success
    return res.status(201).json({
      message: 'Request sent successfully!',
      data: {
        username,
        timestamp
      }
    });

  } catch (error) {
    console.error('Error sending request to join server:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});



// Accept a request to join a server
app.post('/api/servers/request/accept', apiKeyMiddleware, authMiddleware, async (req, res) => {
  try {
    const { username, serverId } = req.body;

    // Validate input
    if (!serverId || !username) {
      return res.status(400).json({ message: 'Missing username or serverId.' });
    }

    // Check if the server exists
    const serverRef = db.ref(`servers/${serverId}`);
    const serverSnapshot = await serverRef.once('value');
    if (!serverSnapshot.exists()) {
      return res.status(404).json({ message: 'Server not found.' });
    }

    // Check if the user is already part of the server
    const userRef = serverRef.child('users').child(username);
    const userSnapshot = await userRef.once('value');
    if (userSnapshot.exists()) {
      // If the user is listed in server's users node, they are already a member
      return res.status(403).json({ message: 'User is already a member of this server.' });
    }

    // Check if the request exists
    const requestRef = serverRef.child('requests').child(username);
    const requestSnapshot = await requestRef.once('value');
    if (!requestSnapshot.exists()) {
      // If there is no request with the same username then exit
      return res.status(403).json({ message: 'No request was found for this user and server.' });
    }

    // Remove the request with {username} as its key from servers/{serverId}/requests
    await requestRef.remove();

    // axios POST request to 'http://localhost:5002/api/servers/add-user' containing serverId and username
    await axios.post('http://localhost:5002/api/servers/add-user', {
      serverId,
      username,
    }, 
    {
      headers: {
        Authorization: req.headers['authorization'],
        'x-api-key': req.headers['x-api-key'],   
      }
    }
    );


    // Return success
    return res.status(201).json({
      message: `Request was accepted successfully!`,
      data: {
        username,
        serverId
      }
    });

  } catch (error) {
    console.error('Error accepting request to join server:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});




// Deny a request to join a server
app.post('/api/servers/request/deny', apiKeyMiddleware, authMiddleware, async (req, res) => {
  try {
    const { username, serverId } = req.body;

    // Validate input
    if (!serverId || !username) {
      return res.status(400).json({ message: 'Missing username or serverId.' });
    }

    // Check if the server exists
    const serverRef = db.ref(`servers/${serverId}`);
    const serverSnapshot = await serverRef.once('value');
    if (!serverSnapshot.exists()) {
      return res.status(404).json({ message: 'Server not found.' });
    }

    // Check if the request exists
    const requestRef = serverRef.child('requests').child(username);
    const requestSnapshot = await requestRef.once('value');
    if (!requestSnapshot.exists()) {
      // If there is no request with the same username then exit
      return res.status(403).json({ message: 'No request was found for this user and server.' });
    }

    // Remove the request with {username} as its key from servers/{serverId}/requests
    await requestRef.remove();

    // Return success
    return res.status(201).json({
      message: `Request was denied for ${username}`,
      data: {
        username,
        serverId
      }
    });

  } catch (error) {
    console.error('Error denying request to join server:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});




// ================ START SERVER ================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
