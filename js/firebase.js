// ============================================
// js/firebase.js
// Firebase Initialization - Centralized Module
// SchoolHub Pro - منصة مدارس الجيل الجديد الخاصة
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
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

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Cloud Firestore
const db = getFirestore(app);

// Email Domain Generator
const EMAIL_DOMAIN = "@follo-3f26c.firebaseapp.com";

// Helper function: Generate email from code
function generateEmail(code) {
    return `${code}${EMAIL_DOMAIN}`;
}

// Export Firebase instances and helpers
export { app, auth, db, generateEmail, EMAIL_DOMAIN };