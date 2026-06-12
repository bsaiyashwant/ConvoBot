import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDCbrgI2szWHYlcH_JzciQs7EE66WWX2ro",
    authDomain: "convobot-1ef8f.firebaseapp.com",
    projectId: "convobot-1ef8f",
    storageBucket: "convobot-1ef8f.firebasestorage.app",
    messagingSenderId: "153975856173",
    appId: "1:153975856173:web:db0ac92b0506f497f2aca4",
    measurementId: "G-M0KFGHYPGY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
