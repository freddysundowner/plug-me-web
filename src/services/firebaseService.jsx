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
  getDoc,
  increment,
} from "firebase/firestore";
import { db } from "../init/firebaseConfig";

export const fetchServices = async () => {
  const querySnapshot = await getDocs(collection(db, "services"));
  const servicesList = querySnapshot.docs.map((doc) => ({
    value: doc.id,
    label: doc.data().name,
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

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

export const getCurrentPosition = () => {
  return navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    return { latitude, longitude };
  });
};

export const getProviders = async (provider) => {
  const usersQuery = query(
    collection(db, "users"),
    where("isProvider", "==", true),
    where("available", "==", true)
  );
  const querySnapshot = await getDocs(usersQuery);
  const providersList = querySnapshot.docs.map((doc) => {
    const providerData = doc.data();

    return {
      id: doc.id,
      ...providerData,
    };
  });
  if (provider?.id) {
    return providersList.filter((doc) => doc.id !== provider.id);
  }

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
export const addInvoice = async (provider, invoiceData) => {
  updateProviderData(provider?.id, {
    currentInvoice: {
      id: invoiceData.invoiceId,
      threadId: invoiceData.threadId,
      provider,
      client: invoiceData?.client,
    },
  });
  updateProviderData(invoiceData?.client?.id, {
    currentInvoice: {
      id: invoiceData.invoiceId,
      threadId: invoiceData.threadId,
      client: invoiceData?.client,
      provider,
    },
  });
};
export const addRating = async (userId, ratingData, invoice) => {
  const ratingsRef = collection(db, "users", userId, "ratings");
  const ratingDocRef = doc(ratingsRef);
  await setDoc(ratingDocRef, ratingData);

  updateProviderData(userId, {
    ratingsCount: increment(1),
    totalRatings: increment(ratingData?.rating),
  });
  updateMessageInFirestore(invoice?.threadId, invoice?.id, {
    rating: ratingData,
  });
};
export const getTransactionThreadId = async (
  currentUserId,
  recipientUserId
) => {
  try {
    const inboxRef = collection(db, "transactions");
    const q = query(inboxRef, where("users", "array-contains", currentUserId));

    const querySnapshot = await getDocs(q);
    let threadId = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
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
export const addPayment = async (transaction) => {
  try {
    let threadId = await getTransactionThreadId(
      transaction?.sender?.id,
      transaction?.receiver?.id
    );

    let threadRef = null;

    if (threadId) {
      threadRef = doc(db, "transactions", threadId);
      await addDoc(collection(threadRef, "payments"), {
        ...transaction,
        threadId,
      });
      await updateDoc(threadRef, { ...transaction, threadId });
    } else {
      threadId = Date.now().toString();
      threadRef = doc(collection(db, "transactions"), threadId);
      await setDoc(threadRef, { ...transaction, threadId }, { merge: true });
      await addDoc(collection(threadRef, "payments"), {
        ...transaction,
        threadId,
      });
    }
  } catch (error) {
    console.error("Error adding message to Firestore:", error);
  }
};
export const getInvoice = async (userId) => {
  const inboxQuery = query(
    collection(db, "inbox"),
    where("users", "array-contains", userId)
  );

  const inboxSnapshot = await getDocs(inboxQuery);

  const allMessages = [];

  for (const inboxDoc of inboxSnapshot.docs) {
    const messagesQuery = query(
      collection(db, `inbox/${inboxDoc.id}/messages`),
      where("type", "==", "quote"),
      orderBy("timestamp", "desc")
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    allMessages.push(...messages);
  }
  return allMessages;
};
export const updateTransactionInFirestore = async (
  threadId,
  messageId,
  data
) => {
  const messageDocRef = doc(
    db,
    "transactions",
    threadId,
    "payments",
    messageId
  );
  await updateDoc(messageDocRef, data);
};
export const getTransactions = async (userId) => {
  const inboxQuery = query(
    collection(db, "transactions"),
    where("users", "array-contains", userId)
  );

  const transactionSnapshot = await getDocs(inboxQuery);

  const allTransactions = [];

  for (const transDoc of transactionSnapshot.docs) {
    const messagesQuery = query(
      collection(db, `transactions/${transDoc.id}/payments`),
      orderBy("timestamp", "desc")
    );

    const transactionsSnapshot = await getDocs(messagesQuery);
    const transactions = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    allTransactions.push(...transactions);
  }
  return allTransactions;
};
export const addMessageToFirestore = async (message) => {

  try {
    let threadId = await getThreadId(
      message?.sender?.id,
      message?.receiver?.id
    );

    let threadRef = null;
    const messageWithReadStatus = {
      ...message,
      read: {
        [message.sender.id]: true, // Sender has read the message
        [message.receiver.id]: false, // Receiver has not read the message
      },
      unreadCounts: {
        [message.receiver.id]: increment(1),
      },
    };

    if (threadId) {
      // Thread exists, add the message to the existing thread
      threadRef = doc(db, "inbox", threadId);
      await addDoc(collection(threadRef, "messages"), {
        ...messageWithReadStatus,
        threadId,
      });
      await updateDoc(threadRef, { ...messageWithReadStatus, threadId });
    } else {
      // Thread does not exist, create a new thread
      threadId = Date.now().toString();
      threadRef = doc(collection(db, "inbox"), threadId);
      await setDoc(
        threadRef,
        { ...messageWithReadStatus, threadId },
        { merge: true }
      );
      await addDoc(collection(threadRef, "messages"), {
        ...messageWithReadStatus,
        threadId,
      });
    }
  } catch (error) {
    console.error("Error adding message to Firestore:", error);
  }
};
export const listenForUserAccountChanges = (userId, callback) => {
  const userDocRef = doc(db, "users", userId);
  const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      callback(userData);
    }
  });
  return () => unsubscribe();
};
export const getInboxMessages = (currentUser, callback) => {
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
  const q = query(
    collection(db, "inbox"),
    where("users", "array-contains", currentUserUid)
  );

  // Listen for real-time updates
  return onSnapshot(q, (snapshot) => {
    let threadId = null;
    try {
      // Find the thread that contains both users
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.users.includes(recipientUserUid)) {
          threadId = doc.id;
        }
      });

      if (threadId) {
        const messagesQuery = query(
          collection(db, "inbox", threadId, "messages"),
          orderBy("timestamp", "asc")
        );

        return onSnapshot(messagesQuery, (messagesSnapshot) => {
          const messages = messagesSnapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              id: doc.id,
            };
          });
          callback(messages);
        });
      } else {
        // If no thread is found, return an empty array
        callback([]);
      }
    } catch (error) {
    } finally {
      onInboxOrChatOpen(threadId, currentUserUid, recipientUserUid);
    }
  });
};

export const markLatestMessageAsRead = async (threadId, userId) => {
  const threadRef = doc(db, "inbox", threadId);
  await updateDoc(threadRef, {
    [`read.${userId}`]: true,
  });
};

// Call this function when the user opens the inbox or chat
export const onInboxOrChatOpen = async (threadId, currentUserId) => {
  await markLatestMessageAsRead(threadId, currentUserId);
  await resetUnreadCount(threadId, currentUserId);
};

const resetUnreadCount = async (threadId, userId) => {
  const threadRef = doc(db, "inbox", threadId);
  await updateDoc(threadRef, {
    [`unreadCounts.${userId}`]: 0,
  });
};

export const getUnreadCount = async (threadId, userId) => {
  const threadRef = doc(db, "inbox", threadId);
  const threadDoc = await getDoc(threadRef);
  if (threadDoc.exists()) {
    const data = threadDoc.data();
    return data.unreadCounts?.[userId] || 0;
  }
  return 0;
};

export const logoutFirebase = async (userId, status) => {
  const userDocRef = doc(db, "users", userId);
  await updateDoc(userDocRef, { online: false, loggedOut: status });
};

export const getUserRatings = async (userId) => {

  const ratingsQuery = query(collection(db, "users", userId, "ratings"));
  const ratingsSnapshot = await getDocs(ratingsQuery);
  const ratings = ratingsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return ratings;
};
