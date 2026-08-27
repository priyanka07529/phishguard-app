import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4YXQAzU-WjdEWgZoOmeCV8qMwE8kJb90",
  authDomain: "phishguard-5c758.firebaseapp.com",
  projectId: "phishguard-5c758",
  storageBucket: "phishguard-5c758.firebasestorage.app",
  messagingSenderId: "555760160272",
  appId: "1:555760160272:web:59596f60825ebd6d024495"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);