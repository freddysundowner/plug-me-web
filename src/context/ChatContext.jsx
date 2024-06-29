import React, { createContext, useState, useEffect } from "react";
import {
  addMessageToFirestore,
  updateMessageInFirestore,
} from "../services/firebaseService";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [visiblePopupMessages, setVisiblePopupMessages] = useState([]);
  const [durationUnit, setDurationUnit] = useState("hours");
  const [showQuotePopup, setShowQuotePopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quotemessage, setQuoteMessage] = useState({});
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "All fields are require",
    error: true,
  });
  const [quotes, setQuotes] = useState([]);
  const [price, setPrice] = useState("");
  const [serviceName, setServiceName] = useState(null);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [messages, setMessages] = useState([]);
  const [inbox, setInbox] = useState([]);

  const addMessage = async (message) => {
    await addMessageToFirestore(message);
  };

  const handleSendQuote = async (type) => {
    if (price <= 0) {
      setShowAlert({
        show: true,
        message: "Please enter a valid price",
        error: true,
      });
      return
    }
    if (date.trim() === "") {
      setShowAlert({
        show: true,
        message: "Please enter a valid date",
        error: true,
      });
      return
    }
    if (quotemessage?.service?.value?.trim() && price.trim() && date.trim()) {
      const newQuote = {
        ...quotemessage, date: date, quote: price, type: 'quote', status: "pending", message: `Hi ${quotemessage?.sender?.username}, attached is my quotation for ${quotemessage?.service?.value?.trim()} on ${date} from ${quotemessage?.from} to ${quotemessage?.to}. Kindly accept or decline.`,
        timestamp: Date.now(),
      }
      console.log(type, quotemessage.id)
      if (type === "update") {
        await updateMessageInFirestore(quotemessage.threadId, quotemessage.id, {
          status: "updated",
        });
      } else {
        await updateMessageInFirestore(quotemessage.threadId, quotemessage.id, {
          status: "accepted",
        });
      }
      await addMessage(newQuote);
      setShowQuotePopup(false);
    } else {
      setShowAlert({
        show: true,
        message: "All fields are required",
        error: true,
      });
    }
  };

  // Inside handleAcceptBooking function
  const handleAcceptBooking = async (id) => {
    let message = messages.find((msg) => msg.id === id);
    if (message) {
      const acceptanceMessage = {
        id: Date.now(),
        sender: "System",
        text: `Booking accepted.`,
        timestamp: new Date().toLocaleTimeString(),
        type: "info",
        service: message.service, // Keep reference of the service
      };
      await addMessage(acceptanceMessage);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === id ? { ...msg, status: "accepted" } : msg
        )
      );
    }
  };

  // Inside handleRejectBooking function
  const handleRejectBooking = async (id, reason) => {
    if (reason.trim() === "") {
      setShowAlert({
        show: true,
        message: "Please enter a reason for rejection",
        error: true,
      });
      return;
    }
    let message = messages.find((msg) => msg.id === id);
    if (message) {
      const rejectionMessage = {
        id: Date.now(),
        sender: "System",
        text: `Booking rejected.\n Reason: ${reason}`,
        timestamp: new Date().toLocaleTimeString(),
        type: "info",
        service: message.service, // Keep reference of the service
      };

      await addMessage(rejectionMessage);
      console.log(rejectionMessage);
      console.log(id);
      await updateMessageInFirestore(id, { status: "rejected" });
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === id ? { ...msg, status: "rejected" } : msg
        )
      );
    }
  };

  useEffect(() => {
    if (messages.length) {
      const newMessage = messages[messages.length - 1];
      if (!newMessage.read) {
        setVisiblePopupMessages((prevMessages) => {
          if (
            prevMessages.some(
              (msg) =>
                msg.text === newMessage.text &&
                msg.sender === newMessage.sender &&
                msg.timestamp === newMessage.timestamp
            )
          ) {
            return prevMessages;
          }
          const updatedMessages = [...prevMessages, newMessage];
          return updatedMessages.length > 5
            ? updatedMessages.slice(-5)
            : updatedMessages;
        });
        const timer = setTimeout(() => {
          setVisiblePopupMessages((prevMessages) =>
            prevMessages.filter((msg) => msg !== newMessage)
          );
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

  const markAsRead = (sender) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.sender === sender ? { ...msg, read: true } : msg
      )
    );
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        markAsRead,
        setVisiblePopupMessages,
        visiblePopupMessages,
        handleSendQuote,
        showQuotePopup,
        setShowQuotePopup,
        setPrice,
        setServiceName,
        setDate,
        setDuration,
        price,
        serviceName,
        duration,
        setDurationUnit,
        durationUnit,
        showAlert,
        setShowAlert,
        handleRejectBooking,
        handleAcceptBooking,
        setMessages, inbox, setInbox, quotemessage, setQuoteMessage, loading, setLoading
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
