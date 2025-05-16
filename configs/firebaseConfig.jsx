// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "app-2025-90069.firebaseapp.com",
  projectId: "app-2025-90069",
  storageBucket: "app-2025-90069.firebasestorage.app",
  messagingSenderId: "835215685652",
  appId: "1:835215685652:web:1f9174bd9adef20ffb8f01",
  measurementId: "G-KP3RDFRJ9P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);