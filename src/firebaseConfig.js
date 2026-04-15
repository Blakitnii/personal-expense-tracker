import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth"; // Додай це

const firebaseConfig = {
  apiKey: "AIzaSyAQ3SbFpPvZR38IY879cZPZ4c9k6xfOU64",
  authDomain: "vutratu-b79f4.firebaseapp.com",
  projectId: "vutratu-b79f4",
  storageBucket: "vutratu-b79f4.firebasestorage.app",
  messagingSenderId: "775443323863",
  appId: "1:775443323863:web:7a13af1f7864dc3cb58992",
  measurementId: "G-TS346R1DPM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);