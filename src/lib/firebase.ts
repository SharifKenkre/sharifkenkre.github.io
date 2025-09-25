// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdv4Qo6gfUUSVPjC4232DtqBAfJXycS4k",
  authDomain: "quizpoint-personalis.firebaseapp.com",
  projectId: "quizpoint-personalis",
  storageBucket: "quizpoint-personalis.appspot.com",
  messagingSenderId: "376883909050",
  appId: "1:376883909050:web:865d4c4b2d92ca0fe58d83"
};

// Initialize Firebase for SSR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
