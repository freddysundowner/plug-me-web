import { useContext, useState } from "react";
import { FaCheck, FaEye, FaTimesCircle } from "react-icons/fa";
import { timeAgo } from "../utils/timeAgo";
import Modal from "react-modal";
import "jspdf-autotable";
import { useSelector } from "react-redux";
import ChatContext from "../context/ChatContext";
import { generateQuoteMsgs } from "../utils/msgs";
import Button from "../sharable/Button";
const Message = ({ message, provider, acceptOffer, rejectOffer }) => {
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const {
    setShowQuotePopup,
    setQuoteMessage,
    handleSendQuote,
    setQuoteAlert,
    quoteAlertType,
    setQuoteAlertType, generatePDF, pdfData, modalIsOpen, setModalIsOpen, generateReceipePDF
  } = useContext(ChatContext);


  return (
    <div
      className={`flex ${message.sender?.id === provider.id ? "justify-end" : "justify-start"
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
        className={`p-2 my-2 rounded-md ${message.type === "request"
          ? "bg-yellow-300 text-black"
          : message.type == "info"
            ? "bg-red-300"
            : message.sender?.id === provider.id
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black"
          }`}
      >
        <p>{generateQuoteMsgs(message, currentProvider?.id)}</p>

        {message.type === "quote" ? (
          <div className="flex mt-2 gap-4">
            {message.status === "completed" && (<button
              onClick={() => {
                if (message.paid == true) {
                  generateReceipePDF("Receipt", message.threadId)
                } else {
                  generatePDF(message.status == 'accepted' ? "Invoice" : "Quotation", message.threadId);

                }
              }
              }
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              <div className="flex gap-2 items-center">
                <FaEye />
                {
                  message?.paid == true ?
                    <p>View Receipt</p> :
                    <p>View {message.status == 'accepted' ? "Invoice" : "Quotation"}</p>
                }
              </div>
            </button>)}
            {message.provider == currentProvider.id && message.status === "pending" && (<button
              onClick={() => {
                if (message.paid == true) {
                  generateReceipePDF("Receipt", message.threadId)
                } else {
                  generatePDF(message.status == 'accepted' ? "Invoice" : "Quotation", message.threadId);

                }
              }
              }
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              <div className="flex gap-2 items-center">
                <FaEye />
                {
                  message?.paid == true ?
                    <p>View Receipt</p> :
                    <p>View {message.status == 'accepted' ? "Invoice" : "Quotation"}</p>
                }
              </div>
            </button>)}
            {message.provider == currentProvider.id && message.status === "pending" && (
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
            {message.provider == currentProvider.id && message.status === "pending" && (
              <Button
                callback={() => {
                  setQuoteMessage({ ...message, rejectBy: currentProvider.id });
                  setQuoteAlert(true);
                  setQuoteAlertType("reject");
                }}
                text="Reject"
                background="bg-red-500"
                icon={<FaTimesCircle />}
              />
            )}
            {/* {message.provider === currentProvider.id && message.status === "pending" && (
              <Button
                callback={() => {
                  setQuoteMessage(message);
                  setQuoteAlert(true);
                  setQuoteAlertType("reject");
                }}
                text="Withdraw"
                background="bg-red-500"
                icon={<FaTimesCircle />}
              />
            )} */}
            {/* {message.provider === currentProvider.id && message.status === "pending" && (
              <button
                onClick={() => {
                  setQuoteMessage(message);
                  setShowQuotePopup(true);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md"
              >
                <div className="flex gap-2 items-center">
                  <FaCheck />
                  <p>Edit Quote</p>
                </div>
              </button>
            )} */}
          </div>
        ) : (
          ""
        )}
        <span className="text-xs text-gray-600">
          {timeAgo(message.timestamp)}
        </span>
        {message.type === "request" &&
          message.status === "pending" &&
          message.provider === currentProvider.id && (
            <div className="flex mt-2">
              <button
                onClick={() => {
                  // setQuoteMessage(message);
                  // setShowQuotePopup(true);

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
                  setQuoteMessage({ ...message, rejectBy: currentProvider.id });
                  setQuoteAlert(true);
                  setQuoteAlertType("reject");
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
