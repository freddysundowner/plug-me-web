import React from "react";
import Modal from "react-modal";

const PDFModal = ({ isOpen, onRequestClose, pdfData }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    ariaHideApp={false}
    style={{
      overlay: { zIndex: 1000 },
      content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        width: "80%",
      },
    }}
  >
    <iframe src={pdfData} width="100%" height="600px" />
    <button onClick={onRequestClose} className="btn btn-secondary">
      Close
    </button>
  </Modal>
);

export default PDFModal;
