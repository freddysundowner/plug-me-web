// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkJP7R6qc3PkAUEr0Uv3D2i0x06NxY9F8",
  authDomain: "newmap3n.firebaseapp.com",
  projectId: "newmap3n",
  storageBucket: "newmap3n.appspot.com",
  messagingSenderId: "219894629811",
  appId: "1:219894629811:web:db4dc4381bfe3cbf72f7c6",
  measurementId: "G-V0581D41W3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
