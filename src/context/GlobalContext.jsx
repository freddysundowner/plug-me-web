// GlobalContext.js
import React, { createContext, useState, useCallback } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
  };
  return (
    <GlobalContext.Provider value={{ showModal, openModal, closeModal }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
