// useOnlineStatus.js
import { useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";

const useOnlineStatus = (userId) => {
  useEffect(() => {
    const setOnlineStatus = async (isOnline) => {
      if (!userId) return;
      const providerRef = doc(db, "users", userId);
      await setDoc(providerRef, { online: isOnline }, { merge: true });
    };

    const handleFocus = () => setOnlineStatus(true);
    const handleBlur = () => setOnlineStatus(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    setOnlineStatus(navigator.onLine);

    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId]);
};

export default useOnlineStatus;
