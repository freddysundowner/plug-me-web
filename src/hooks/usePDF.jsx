import { useContext } from "react";
import ChatContext from "../context/ChatContext";

const usePDF = () => {
  const {
    generatePDF,
    generateReceipePDF,
    pdfData,
    modalIsOpen,
    setModalIsOpen,
  } = useContext(ChatContext);

  const viewPDF = (title, threadId, isPaid) => {
    if (isPaid) {
      generateReceipePDF("Receipt", threadId);
    } else {
      generatePDF(title, threadId);
    }
    setModalIsOpen(true);
  };

  return { pdfData, modalIsOpen, setModalIsOpen, viewPDF };
};

export default usePDF;
