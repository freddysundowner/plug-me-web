import React, { createContext, useState, useContext } from "react";
import Modal from "../modal/AcceptRejectOffer"; // Adjust the import path according to your project structure
import AlertModal from "../modal/AlertModal";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null);
  const [modalId, setModalId] = useState(null);

  const openModal = (content, id) => {
    setModalContent(content);
    setModalId(id || Date.now());
  };

  const closeModal = () => {
    setModalContent(null);
    setModalId(null);
  };
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
    <GlobalContext.Provider
      value={{
        modalContent,
        openModal,
        closeModal,
        modalId,
        showAlert,
      }}
    >
      {children}
      {modalContent && (
        <Modal key={modalId} onClose={closeModal}>
          {modalContent}
        </Modal>
      )}
      {alert.isOpen && (
        <AlertModal
          message={alert.message}
          onConfirm={handleConfirm}
          onCancel={closeAlert}
        />
      )}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

export default GlobalContext;
