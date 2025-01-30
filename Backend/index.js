// Import the http module
const http = require('http');

// Define the server
const server = http.createServer((req, res) => {
  res.statusCode = 200; // HTTP status code 200 (OK)
  res.setHeader('Content-Type', 'text/plain'); // Set response header type
  res.end('Hello, World!'); // Send a response
});

server.listen(3000, 'localhost', () => {
  console.log('Server running at http://localhost:3000/');
});


import firebase from 'firebase/app';
import 'firebase/firestore'; 

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();


