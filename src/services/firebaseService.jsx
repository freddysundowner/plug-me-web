// src/services/firebaseService.js
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";

export const fetchServices = async () => {
  const querySnapshot = await getDocs(collection(db, "services"));
  const servicesList = querySnapshot.docs.map((doc) => ({
    value: doc.id,
    label: doc.data().label,
  }));
  return servicesList;
};
export const updateProviderAvailability = async (userId, services) => {
  const userDocRef = doc(db, "users", userId);
  await updateDoc(userDocRef, { services });
};
