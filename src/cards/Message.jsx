import { useContext, useState } from "react";
import {
  FaCheck,
  FaEye,
  FaTimesCircle,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import { timeAgo } from "../utils/timeAgo";
import Modal from "react-modal";
import "jspdf-autotable";
import { useSelector } from "react-redux";
import ChatContext from "../context/ChatContext";
import { generateQuoteMsgs } from "../utils/msgs";
import Button from "../sharable/Button";
import { updateMessageInFirestore } from "../services/firebaseService";
const Message = ({ message, provider }) => {
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const {
    setQuoteMessage,
    setQuoteAlert,
    setQuoteAlertType,
    generatePDF,
    pdfData,
    modalIsOpen,
    setModalIsOpen,
    generateReceipePDF,
    addMessage,
  } = useContext(ChatContext);

  const handleReject = async (message) => {
    updateMessageInFirestore(message.threadId, message.id, {
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
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
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
        <button
          onClick={() => setModalIsOpen(false)}
          className="btn btn-secondary"
        >
          Close
        </button>
      </Modal>
      <div
        className={`p-2 my-2 rounded-md ${
          message.type === "request"
            ? "bg-yellow-300 text-black"
            : message.type == "info"
            ? "bg-red-300"
            : message.sender?.id === provider.id
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        <p>{generateQuoteMsgs(message, currentProvider?.id)}</p>

        {message.type === "quote" ||
        message.type === "released" ||
        message.type === "ratings" ? (
          <div className="flex mt-2 gap-4">
            {message.status === "progress" ||
              (message.status === "accepted" && (
                <button
                  onClick={() => {
                    if (message.paid == true) {
                      generateReceipePDF("Receipt", message.threadId);
                    } else {
                      generatePDF(
                        message.status == "accepted" ? "Invoice" : "Quotation",
                        message.threadId
                      );
                    }
                  }}
                  className="px-4 py-2 bg-black text-white rounded-md"
                >
                  <div className="flex gap-2 items-center">
                    <FaEye />
                    {message?.paid == true ? (
                      <p>View Receipt</p>
                    ) : (
                      <p>
                        View{" "}
                        {message.status == "accepted" ? "Invoice" : "Quotation"}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            {message.type === "ratings" && (
              <div>
                <div className="flex items-center  cursor-pointer">
                  {Array.from({ length: 5 }).map((_, index) =>
                    index < message?.rating ? (
                      <FaStar key={index} className="text-yellow-500" />
                    ) : (
                      <FaRegStar key={index} className="text-yellow-500" />
                    )
                  )}
                  <span className=" text-gray-600 text-xs">
                    ({message.rating ?? 0})
                  </span>
                </div>

                <span className=" text-gray-600 text-xs">
                  {message.comment ?? ""}
                </span>
              </div>
            )}
            {message.provider?.id == currentProvider.id &&
              message.status === "pending" && (
                <button
                  onClick={() => {
                    if (message.paid == true) {
                      generateReceipePDF("Receipt", message.threadId);
                    } else {
                      generatePDF(
                        message.status == "accepted" ? "Invoice" : "Quotation",
                        message.threadId
                      );
                    }
                  }}
                  className="px-4 py-2 bg-black text-white rounded-md"
                >
                  <div className="flex gap-2 items-center">
                    <FaEye />
                    {message?.paid == true ? (
                      <p>View Receipt</p>
                    ) : (
                      <p>
                        View{" "}
                        {message.status == "accepted" ? "Invoice" : "Quotation"}
                      </p>
                    )}
                  </div>
                </button>
              )}
            {message.provider?.id == currentProvider.id &&
              message.status === "pending" && (
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
              )}
            {message.provider?.id == currentProvider.id &&
              message.status === "pending" && (
                <Button
                  callback={() => {
                    handleReject(message);
                  }}
                  text="Reject"
                  background="bg-red-500"
                  icon={<FaTimesCircle />}
                />
              )}
          </div>
        ) : (
          ""
        )}
        <span className="text-xs text-gray-600">
          {timeAgo(message.timestamp)}
        </span>
        {message.type === "request" &&
          message.status === "pending" &&
          message.provider?.id === currentProvider.id && (
            <div className="flex mt-2">
              <button
                onClick={() => {
                  setQuoteMessage(message);
                  setQuoteAlert(true);
                  setQuoteAlertType("accept");
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md mr-4"
              >
                <div className="flex gap-2 items-center">
                  <FaCheck />
                  <p>Accept Offer</p>
                </div>
              </button>

              <button
                onClick={() => {
                  updateMessageInFirestore(message.threadId, message.id, {
                    status: "void",
                  });
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                <div className="flex gap-2 items-center">
                  <FaTimesCircle />
                  <p>Reject</p>
                </div>
              </button>
            </div>
          )}
      </div>
    </div>
  );
};
export default Message;
