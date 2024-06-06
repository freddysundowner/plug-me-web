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
import Modal from "../sharable/Modal";
import GlobalContext from "../context/GlobalContext";

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
  } = useContext(ChatContext); // Use messages from ChatContext
  const { showModal, closeModal } = useContext(GlobalContext);
  const [input, setInput] = useState("");
  const [acceptedBookingId, setAcceptedBookingId] = useState(null);
  const [showNewMessageBubble, setShowNewMessageBubble] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

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

  const handleAcceptBooking = (id) => {
    setAcceptedBookingId(id);
  };

  // const handleRejectBooking = (id) => {
  //   let message = messages.filter((msg) => msg.id == id);
  //   if (message) {
  //     const rejectionMessage = {
  //       id: Date.now(),
  //       sender: "System",
  //       text: `Booking rejected.`,
  //       timestamp: new Date().toLocaleTimeString(),
  //       type: "info",
  //     };
  //     addMessage(rejectionMessage);
  //   }
  //   console.log(message);
  // };

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
              <Message message={message} provider={provider} key={message.id} />
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
      {showModal && (
        <Modal onClose={closeModal}>
          {" "}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded-md w-full mt-4"
            placeholder="Why do you want to reject"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
        </Modal>
      )}
    </Drawer>
  );
};

export default ChatPage;
