import React, { useContext } from "react";
import { FaCheck, FaEye, FaTimesCircle } from "react-icons/fa";
import { timeAgo } from "../utils/timeAgo";
import { useSelector } from "react-redux";
import Button from "../components/Button";
import ChatContext from "../context/ChatContext";
import usePDF from "../hooks/usePDF";
import RatingDisplay from "../components/RatingDisplay";
import PDFModal from "../modal/PDFModal";
import { updateMessageInFirestore } from "../services/firebaseService";
import { generateQuoteMsgs } from "../utils/msgs";

const MessageActions = ({
  message,
  currentProvider,
  provider,
  handleReject,
  viewPDF,
}) => {
  const { setQuoteMessage, setQuoteAlert, setQuoteAlertType } =
    useContext(ChatContext);

  return (
    <div className="flex mt-2 gap-4">
      {["quote", "released", "ratings"].includes(message.type) && (
        <>
          {(message.status === "progress" || message.status === "accepted") && (
            <button
              onClick={() =>
                viewPDF(
                  message.status === "accepted" ? "Invoice" : "Quotation",
                  message.threadId,
                  message.paid
                )
              }
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              <div className="flex gap-2 items-center">
                <FaEye />
                <p>
                  {message.paid
                    ? "View Receipt"
                    : `View ${
                        message.status === "accepted" ? "Invoice" : "Quotation"
                      }`}
                </p>
              </div>
            </button>
          )}

          {message.type === "ratings" && (
            <RatingDisplay rating={message.rating} comment={message.comment} />
          )}

          {message.provider?.id === currentProvider.id &&
            message.status === "pending" && (
              <>
                <button
                  onClick={() => {
                    setQuoteMessage(message);
                    setQuoteAlert(true);
                    setQuoteAlertType("accept");
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  <div className="flex gap-2 items-center">
                    <FaCheck />
                    <p>Accept</p>
                  </div>
                </button>

                <Button
                  callback={() => handleReject(message)}
                  text="Reject"
                  background="bg-red-500"
                  icon={<FaTimesCircle />}
                />
              </>
            )}
        </>
      )}
    </div>
  );
};

const Message = ({ message, provider }) => {
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const { addMessage } = useContext(ChatContext);
  const { pdfData, modalIsOpen, setModalIsOpen, viewPDF } = usePDF();

  const handleReject = async (message) => {
    await updateMessageInFirestore(message.threadId, message.id, {
      status: "void",
    });
    addMessage({
      sender: {
        id: currentProvider.id,
        username: currentProvider.username,
        photoURL: currentProvider?.photoURL ?? null,
      },
      receiver: {
        id: provider.id,
        username: provider.username,
        photoURL: provider?.photoURL ?? null,
      },
      service: message.service,
      message: "rejected",
      timestamp: Date.now(),
      users: [currentProvider.id, provider.id],
      type: "rejected",
    });
  };

  return (
    <div
      className={`flex ${
        message.sender?.id === provider.id
          ? "justify-end ml-10"
          : "justify-start mr-10"
      }`}
    >
      <PDFModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        pdfData={pdfData}
      />

      <div
        className={`p-2 my-2 rounded-md ${
          message.type === "request"
            ? "bg-yellow-300 text-black"
            : message.type === "info"
            ? "bg-red-300"
            : message.sender?.id === provider.id
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        <p>{generateQuoteMsgs(message, currentProvider?.id)}</p>
        <MessageActions
          message={message}
          currentProvider={currentProvider}
          provider={provider}
          handleReject={handleReject}
          viewPDF={viewPDF}
        />
        <span className="text-xs text-gray-600">
          {timeAgo(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default Message;
