// ============================================
// js/firebase.js
// Firebase Initialization - Firestore Only
// SchoolHub Pro - منصة مدارس الجيل الجديد
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAtjQ3-KjPweYcSDPYB63MZNUeIDIUjusM",
    authDomain: "follo-3f26c.firebaseapp.com",
    projectId: "follo-3f26c",
    storageBucket: "follo-3f26c.firebasestorage.app",
    messagingSenderId: "537390194014",
    appId: "1:537390194014:web:8e4fe0d6f861a9ea4543cf",
    measurementId: "G-K300NE2BNV"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
const db = getFirestore(app);

// Export Firestore instance
export { app, db };