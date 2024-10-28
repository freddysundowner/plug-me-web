import { useState } from "react";
import { auth, db } from "../init/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setProvider, clearProvider } from "../redux/features/providerSlice";
import { logoutFirebase } from "../services/firebaseService";

export const useSignIn = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        dispatch(setProvider(userDoc.data()));
        logoutFirebase(auth.currentUser?.uid, false);
      }
    } catch (err) {
      setError(err);
    }
  };

  return { signIn, error };
};

export const useSignUp = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const signUp = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userData = {
        email: user.email,
        isProvider: false,
        online: true,
        username,
        id: user.uid,
        loggedOut: false,
        available: true,
      };

      await setDoc(doc(db, "users", user.uid), userData);
      dispatch(setProvider(userData));
    } catch (err) {
      setError(err);
    }
  };

  return { signUp, error };
};

export const useSignOut = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const signOutUser = async () => {
    try {
      logoutFirebase(auth.currentUser?.uid, true);
      await signOut(auth);
      dispatch(clearProvider());
    } catch (err) {
      setError(err);
    }
  };

  return { signOutUser, error };
};
