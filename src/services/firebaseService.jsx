// src/services/firebaseService.js
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  where,
  setDoc,
} from "firebase/firestore";
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

export const updateProviderData = async (userId, data) => {
  const userDocRef = doc(db, "users", userId);
  await updateDoc(userDocRef, data);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

export const getProviders = async () => {
  // Get user's current position
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const position = await getCurrentPosition();
  const userLat = position.coords.latitude;
  const userLon = position.coords.longitude;

  const querySnapshot = await getDocs(collection(db, "users"));
  const providersList = querySnapshot.docs
    .filter((doc) => doc.data().isProvider)
    .map((doc) => {
      const providerData = doc.data();
      const providerLocation = providerData.geopoint;
      const distance = calculateDistance(
        userLat,
        userLon,
        providerLocation.latitude,
        providerLocation.longitude
      );

      return {
        id: doc.id,
        ...providerData,
        distance: distance.toFixed(2),
      };
    });

  return providersList;
};
export const getThreadId = async (currentUserId, recipientUserId) => {
  try {
    // Query to check if a thread exists between the current user and the recipient
    const inboxRef = collection(db, "inbox");
    const q = query(inboxRef, where("users", "array-contains", currentUserId));

    const querySnapshot = await getDocs(q);
    let threadId = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if the document has both participants
      if (data.users.includes(recipientUserId)) {
        threadId = doc.id;
      }
    });

    return threadId;
  } catch (error) {
    console.error("Error checking for existing thread:", error);
    return null;
  }
};
export const addMessageToFirestore = async (message) => {
  try {
    // Get the thread ID if it exists
    const threadId = await getThreadId(
      message?.sender?.id,
      message?.receiver?.id
    );
    console.log("threadId ", threadId);

    let threadRef = null;
    if (threadId) {
      // Thread exists, add the message to the existing thread
      threadRef = doc(db, "inbox", threadId);
      await addDoc(collection(threadRef, "messages"), message);
    } else {
      // Thread does not exist, create a new thread
      threadRef = doc(collection(db, "inbox"), Date.now().toString());
      await setDoc(threadRef, message, { merge: true });
      await addDoc(collection(threadRef, "messages"), message);
    }
  } catch (error) {
    console.error("Error adding message to Firestore:", error);
  }
  // const threadRef = doc(db, "inbox", Date.now().toString());
  // await addDoc(collection(threadRef, "messages"), message);
  // await setDoc(threadRef, message, { merge: true });
};

export const getMessagesFromFirestore = (currentUser, callback) => {
  console.log(currentUser);
  const q = query(
    collection(db, "inbox"),
    where("users", "array-contains", currentUser?.uid)
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

export const updateMessageInFirestore = async (threadId, messageId, data) => {
  const messageDocRef = doc(db, "inbox", threadId, "messages", messageId);
  await updateDoc(messageDocRef, data);
};


export const getAllMessages = (currentUserUid, recipientUserUid, callback) => {
  // Query to find the thread that contains both users
  const q = query(
    collection(db, "inbox"),
    where("users", "array-contains", currentUserUid)
  );

  // Listen for real-time updates
  return onSnapshot(q, (snapshot) => {
    let threadId = null;

    // Find the thread that contains both users
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(recipientUserUid)) {
        threadId = doc.id;
      }
    });

    if (threadId) {
      // If thread is found, query the messages collection within that thread
      const messagesQuery = query(
        collection(db, "inbox", threadId, "messages")
      );

      return onSnapshot(messagesQuery, (messagesSnapshot) => {
        const messages = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(messages);
      });
    } else {
      // If no thread is found, return an empty array
      callback([]);
    }
  });
};