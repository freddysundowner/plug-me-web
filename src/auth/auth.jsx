// src/auth.js
import { auth, db } from "../auth/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import store from "../redux/store"; // Import the store
import { setProvider, clearProvider } from "../redux/features/providerSlice"; // Import the actions

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      store.dispatch(setProvider(userDoc.data())); // Dispatch to save in Redux
    }
    console.log("User signed in");
  } catch (error) {
    console.error("Error signing in:", error);
    throw error; // Throw error to be caught in handleSubmit
  }
};

export const signUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userData = {
      email: user.email,
      isProvider: false, // or true based on your application logic
      online: true,
      username,
      id: user.uid,
    };
    await setDoc(doc(db, "users", user.uid), userData);
    store.dispatch(setProvider(userData)); // Dispatch to save in Redux
    console.log("User signed up and data added to Firestore");
  } catch (error) {
    console.error("Error signing up:", error);
    throw error; // Throw error to be caught in handleSubmit
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    store.dispatch(clearProvider()); // Clear user data from Redux
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
