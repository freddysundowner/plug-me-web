import React, { createContext, useState, useEffect } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [visiblePopupMessages, setVisiblePopupMessages] = useState([]);
  const [durationUnit, setDurationUnit] = useState("hours");
  const [showQuotePopup, setShowQuotePopup] = useState(false);
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
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      sender: "System",
      text: `Hello, please select a provider and make an appointment.`,
      timestamp: Date.now(),
      type: "message",
      read: false,
    },
  ]);

  const botMessages = [
    "Welcome! How can I help you today?",
    "Don't forget to check our latest updates.",
    "If you have any questions, feel free to ask.",
    "Thank you for using our service.",
    "Have a great day!",
  ];

  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleSendQuote = (provider) => {
    if (serviceName?.value?.trim() && price.trim() && duration.trim()) {
      const newQuote = {
        id: quotes.length + 1,
        sender: provider.name,
        text: `Service: ${
          serviceName?.value
        }, Price: $${price}, Duration: ${duration} ${durationUnit?.value}${
          date ? `, Date: ${date}` : ""
        }`,
        timestamp: new Date().toLocaleTimeString(),
        type: "quote",
        status: "pending",
      };
      addMessage(newQuote);
      setQuotes([...quotes, newQuote]);
      setShowQuotePopup(false);
    } else {
      setShowAlert({
        show: true,
        message: "All fields are require",
        error: true,
      });
    }
  };
  const handleRejectBooking = (id) => {
    let message = messages.filter((msg) => msg.id == id);
    if (message) {
      const rejectionMessage = {
        id: Date.now(),
        sender: "System",
        text: `Booking rejected.`,
        timestamp: new Date().toLocaleTimeString(),
        type: "info",
      };
      addMessage(rejectionMessage);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === id ? { ...msg, status: "rejected" } : msg
        )
      );
    }
    console.log(message);
  };

  // useEffect(() => {
  //   const botInterval = setInterval(() => {
  //     const randomMessage =
  //       botMessages[Math.floor(Math.random() * botMessages.length)];
  //     addMessage({
  //       id: Date.now(),
  //       sender: "Bot",
  //       text: randomMessage,
  //       timestamp: Date.now(),
  //       type: "bot",
  //       read: false,
  //     });
  //   }, 2000);

  //   return () => clearInterval(botInterval);
  // }, []);

  useEffect(() => {
    if (messages.length) {
      const newMessage = messages[messages.length - 1];
      if (!newMessage.read) {
        // Check if the message is unread
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

  const unreadCount = () => {
    // Your unread count logic
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        markAsRead,
        unreadCount,
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
