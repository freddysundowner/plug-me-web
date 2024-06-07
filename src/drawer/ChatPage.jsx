import React, { useContext, useState, useRef, useEffect } from "react";
import {
  FaTimes,
  FaPaperPlane,
  FaCheck,
  FaTimesCircle,
  FaTasks,
  FaArrowDown,
} from "react-icons/fa";
import Drawer from "./Drawer"; // Import the reusable Drawer component
import ChatContext from "../context/ChatContext"; // Import ChatContext
import Quote from "../sharable/Quote";
import Message from "../cards/Message";

const ChatPage = ({ provider, isOpen, onClose, user }) => {
  const {
    messages,
    addMessage,
    setVisiblePopupMessages,
    showQuotePopup,
    setShowQuotePopup,
    setServiceName,
    setPrice,
    setDate,
    setDuration,
    handleRejectBooking,
    handleAcceptBooking,
  } = useContext(ChatContext);
  const [input, setInput] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showNewMessageBubble, setShowNewMessageBubble] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [type, setType] = useState("");
  const [message, setMessage] = useState({});
  const [openmodal, setOpenModal] = useState(false);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: provider.name,
        text: input,
        timestamp: new Date().toLocaleTimeString(),
      };
      addMessage(newMessage);
      setInput("");
    }
  };
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop === clientHeight;
      setIsAutoScroll(isAtBottom);
      if (!isAtBottom) {
        setNewMessagesCount(messages.length - newMessagesCount);
      } else {
        setNewMessagesCount(0);
      }
      setShowNewMessageBubble(!isAtBottom && messages.length > 0);
    }
  };

  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom();
    } else {
      setNewMessagesCount(messages.length - newMessagesCount);
    }
  }, [messages]);
  const showModal = (message, type) => {
    setOpenModal(true);
    setMessage(message);
    setType(type);
  };

  return (
    <Drawer
      title={`${provider.name}`}
      subText={`Online` || `Last seen ${provider.lastSeen}`}
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setVisiblePopupMessages([]);
      }}
      actionButton={
        <button
          onClick={() => {
            // handleSendQuote();
            setShowQuotePopup(true);
            setServiceName("");
            setPrice("");
            setDuration("");
            setDate("");
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-md mr-4"
        >
          Submit Quote
        </button>
      }
    >
      <div className="flex flex-col h-full">
        <div
          className="flex-1 p-4 overflow-y-auto pb-20 mb-28"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          <div className="mb-4">
            {messages.map((message) => (
              <Message
                message={message}
                provider={provider}
                key={message.id}
                rejectOffer={(message) => showModal(message, "reject")}
                acceptOffer={(message) => showModal(message, "accept")}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="flex items-center p-4 border-t border-gray-200 absolute bottom-0 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded-md"
            placeholder="Type a message or quote..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            className="mx-2 text-blue-500 hover:text-blue-700"
          >
            <FaPaperPlane />
          </button>
          <button
            onClick={() => setShowQuotePopup(true)}
            className="mx-2 text-green-500 hover:text-green-700"
          >
            <FaTasks />
          </button>
        </div>
        {showNewMessageBubble && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-16 right-4 p-2 bg-blue-500 text-white rounded-full shadow-lg"
          >
            You have {newMessagesCount} new messages
          </button>
        )}
      </div>

      {showQuotePopup && <Quote provider={provider} />}
      <AcceptRejectOffer
        isOpen={openmodal}
        type={type}
        message={message}
        setOpenModal={setOpenModal}
      />
    </Drawer>
  );
};

export default ChatPage;
const AcceptRejectOffer = ({ type, message, isOpen, setOpenModal }) => {
  if (isOpen === false) return null;
  const [rejectReason, setRejectReason] = useState("");
  const { handleRejectBooking } = useContext(ChatContext);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-md shadow-md w-2/3 mx-10">
        <div className="flex justify-between items-center ">
          <h3 className="text-lg font-semibold mb-4">
            {type === "accept" ? "" : "Reject Offer"}
          </h3>
          <button onClick={() => setOpenModal(false)} className="text-red-500">
            Close
          </button>
        </div>
        {type === "reject" && (
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="flex-1 p-2 border rounded-md w-full mt-4"
            placeholder="message"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
        )}
        {type === "accept" && (
          <p className="text-gray-500 mt-4">
            Are you sure you want to accept this offer?
          </p>
        )}
        <div className="flex justify-end mt-4">
          <div className="flex">
            {/* <button
              onClick={() => {
                setOpenModal(false);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Cancel
            </button> */}
            <button
              onClick={() => {
                setOpenModal(false);
                if (type === "accept") {
                } else {
                  handleRejectBooking(message.id, rejectReason);
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              {type === "accept" ? "Yes" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
