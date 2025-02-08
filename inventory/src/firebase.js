// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

// Firebase configuration object (you can find this in your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyDq3Htb3rmhajlacOxl-YOehT5IW0mUlFU",
  authDomain: "zhiyuan-inventory.firebaseapp.com",
  databaseURL: "https://zhiyuan-inventory-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhiyuan-inventory",
  storageBucket: "zhiyuan-inventory.firebasestorage.app",
  messagingSenderId: "274439912070",
  appId: "1:274439912070:web:c059c4726c3da266186f07",
  measurementId: "G-CV89BZE58Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const db = getFirestore(app); // Initialize Firestore

export { auth, database, signInWithEmailAndPassword, ref, get, db, collection, addDoc, getDocs };
