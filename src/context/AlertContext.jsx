import React, { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export const useAlert = () => {
  return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  const showAlert = (message, onConfirm) => {
    setAlert({ isOpen: true, message, onConfirm });
  };

  const handleConfirm = () => {
    if (alert.onConfirm) alert.onConfirm();
    closeAlert();
  };

  const closeAlert = () => {
    setAlert({ isOpen: false, message: "", onConfirm: null });
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert.isOpen && (
        <AlertModal
          message={alert.message}
          onConfirm={handleConfirm}
          onCancel={closeAlert}
        />
      )}
    </AlertContext.Provider>
  );
};
