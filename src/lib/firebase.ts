// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// This is a public configuration and is safe to be exposed
const firebaseConfig = {
  apiKey: "AIzaSyC26sN44D-n4sdieEvZTraVU-6tL6srpTU",
  authDomain: "for-v5-quiz-project.firebaseapp.com",
  projectId: "for-v5-quiz-project",
  storageBucket: "for-v5-quiz-project.firebasestorage.app",
  messagingSenderId: "201031107326",
  appId: "1:201031107326:web:a42c05237cc4bcd5171baf",
  measurementId: "G-26S84L84XN"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };

