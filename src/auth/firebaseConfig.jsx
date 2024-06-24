// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcZrQ0zVfWYnZLTJSZPbpSeWqRaqe7nRc",
  authDomain: "plugme-e1aba.firebaseapp.com",
  projectId: "plugme-e1aba",
  storageBucket: "plugme-e1aba.appspot.com",
  messagingSenderId: "419619544748",
  appId: "1:419619544748:web:e3c7f30a94452eefdac909",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
