import React, { useContext, useState, useRef, useEffect } from "react";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaPaperPlane,
  FaReceipt,
  FaTasks,
} from "react-icons/fa";
import Drawer from "./Drawer"; // Import the reusable Drawer component
import ChatContext from "../context/ChatContext"; // Import ChatContext
import Quote from "../modal/Quote";
import Message from "../cards/Message";
import { useSelector } from "react-redux";
import {
  getAllMessages,
  listenForUserAccountChanges,
  addPayment,
  updateProviderData,
  addRating,
  updateMessageInFirestore,
} from "../services/firebaseService";
import Button from "../components/Button";
import PaymentDrawer from "./Payment";
import { increment } from "firebase/firestore";
import RatingModal from "../modal/RateUser";
import { useGlobalContext } from "../context/GlobalContext";
import AlertModal from "../modal/AlertModal";
const ChatPage = ({ provider, isOpen, onClose, thread }) => {
  const {
    messages,
    addMessage,
    setVisiblePopupMessages,
    showQuotePopup,
    setShowQuotePopup,
    setQuoteMessage,
    setMessages,
    quoteAlert,
    setQuoteAlert,
    generatePDF,
    payInvoice,
  } = useContext(ChatContext);

  const [input, setInput] = useState("");
  const [showNewMessageBubble, setShowNewMessageBubble] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const { showAlert } = useGlobalContext();
  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = {
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
        message: input,
        timestamp: Date.now(),
        users: [currentProvider.id, provider.id],
        type: "message",
      };
      addMessage(newMessage);
      setInput("");
    }
  };
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const unsubscribe = getAllMessages(
      currentProvider?.id,
      provider?.id,
      setMessages
    );
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    // if (messagesContainerRef.current) {
    //   const { scrollTop, scrollHeight, clientHeight } =
    //     messagesContainerRef.current;
    //   const isAtBottom = scrollHeight - scrollTop === clientHeight;
    //   setIsAutoScroll(isAtBottom);
    //   let unreadCount = messages.filter((msg) => msg.unreadCounts[currentProvider?.id] > 0);
    //   console.log(unreadCount.length);
    //   if (!isAtBottom) {
    //     setNewMessagesCount(unreadCount.length);
    //   } else {
    //     setNewMessagesCount(0);
    //   }
    //   setShowNewMessageBubble(!isAtBottom && unreadCount.length > 0);
    // }
  };

  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom();
    } else {
      setNewMessagesCount(messages.length - newMessagesCount);
    }
  }, [messages]);
  const showModal = (message, type) => {
    setQuoteMessage(message);
    setShowQuotePopup(true);
    // setServiceName("");
    // setPrice("");
    // setDuration("");
    // setDate("");

    // setOpenModal(true);
    // setMessage(message);
    // setType(type);
  };

  useEffect(() => {
    if (currentProvider?.id) {
      listenForUserAccountChanges(currentProvider.id, (user) => {
        setActiveInvoice(user.currentInvoice);
      });
    }
  }, [currentProvider]);

  const handleOpenPaymentDrawer = () => {
    setShowPaymentDrawer(true);
  };

  const handleClosePaymentDrawer = () => {
    setShowPaymentDrawer(false);
  };
  const handleReaseEscrol = () => {
    showAlert("Are you sure you want to release money to provider?", () => {
      updateProviderData(currentProvider.id, {
        "currentInvoice.rated": false,
        "currentInvoice.released": true,
      });
      updateProviderData(provider?.id, {
        "currentInvoice.rated": false,
        "currentInvoice.released": true,
        balance: increment(activeInvoice?.amount),
      });

      const newMessage = {
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
        provider: activeInvoice.provider,
        amount: activeInvoice.amount,
        message: "released",
        timestamp: Date.now(),
        users: [currentProvider.id, provider.id],
        type: "released",
      };

      addMessage(newMessage);

      //save commission
      const transactionCommission = {
        amount: activeInvoice?.amount * 0.1,
        timestamp: Date.now(),
        sender: {
          id: currentProvider?.id,
          name: currentProvider?.username,
        },
        paymentMethod: "stripe",
        type: "commission",
        provider: activeInvoice?.provider,
        receiver: activeInvoice.provider,
        date: new Date(),
        users: [activeInvoice?.provider?.id, currentProvider?.id],
      };
      addPayment(transactionCommission);
      // updateTransactionInFirestore(activeInvoice?.threadId, activeInvoice?.id, { "status": "completed" })
    });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitRating = async ({ rating, comment }) => {
    let to = "";
    if (currentProvider?.id == activeInvoice?.provider) {
      to = activeInvoice?.client?.id;
    } else {
      to = activeInvoice?.provider?.id;
    }
    const ratingData = {
      from: {
        username: currentProvider.username,
        id: currentProvider.id,
      },
      to: {
        username: provider.username,
        id: provider.id,
      },
      rating: rating,
      comment: comment,
      author: currentProvider?.username,
    };
    const newMessage = {
      sender: {
        id: currentProvider.id,
        username: currentProvider.username,
        photoURL: currentProvider?.photoURL ?? null,
      },
      rating: rating,
      comment: comment,
      receiver: {
        id: provider.id,
        username: provider.username,
        photoURL: provider?.photoURL ?? null,
      },
      provider: activeInvoice.provider,
      amount: activeInvoice.amount,
      message: "ratings",
      timestamp: Date.now(),
      users: [currentProvider.id, provider.id],
      type: "ratings",
    };

    addMessage(newMessage);

    setLoading(true);
    await addRating(to, ratingData, activeInvoice);
    setLoading(false);
    updateProviderData(currentProvider.id, {
      currentInvoice: null,
    });
  };
  const handleSubmitTask = async () => {
    showAlert("Are you sure you want to submit the task?", () => {
      addMessage({
        sender: activeInvoice.provider,
        message: "review task",
        timestamp: Date.now(),
        users: [currentProvider.id, provider.id],
        type: "reviewtask",
        receiver: activeInvoice.client,
        provider: activeInvoice.provider,
      });
      updateProviderData(currentProvider.id, {
        "currentInvoice.status": "review",
      });
    });
  };

  return (
    <Drawer
      title={`${provider?.username}`}
      subText={`Online` || `Last seen ${provider.lastSeen}`}
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setVisiblePopupMessages([]);
      }}
      actionButton={
        <div className="mr-4">
          {activeInvoice ? (
            <div className="mr-4 gap-2 flex flex-row">
              {currentProvider.isProvider == true &&
                activeInvoice?.paid == true &&
                activeInvoice?.released == false && (
                  <Button
                    background="bg-yellow-400"
                    callback={() => {
                      handleSubmitTask();
                    }}
                    text={
                      activeInvoice?.status == "review"
                        ? "Send Reminder to Review"
                        : "Submit the task"
                    }
                  />
                )}
              {activeInvoice?.rated == false && (
                <Button callback={handleOpenModal} text={`Write a review`} />
              )}
              {currentProvider.isProvider == false &&
              activeInvoice?.paid == null ? (
                <Button
                  callback={handleOpenPaymentDrawer}
                  text="Deposit Escrol"
                  icon={<FaCreditCard />}
                />
              ) : (
                <></>
              )}
              {activeInvoice?.paid == null ? (
                <Button
                  callback={() =>
                    generatePDF("invoice", activeInvoice?.threadId)
                  }
                  text="View Invoice"
                  background="bg-yellow-500"
                  icon={<FaReceipt />}
                />
              ) : (
                <></>
              )}
              {currentProvider.isProvider == false &&
              activeInvoice?.released == false ? (
                <Button callback={handleReaseEscrol} text="Release Escrol" />
              ) : (
                <></>
              )}
            </div>
          ) : (
            // currentProvider.isProvider ? <Button
            //   callback={() => {
            //     setShowQuotePopup(true);
            //   }}
            //   text={"Submit a Quote"}
            // />
            //   :
            <></>
          )}
        </div>
      }
    >
      <div className="flex flex-col h-full">
        <div
          className="flex-1 p-4 overflow-y-auto pb-20 mb-28"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          <div className="mb-4">
            {messages.map((message, index) => {
              if (
                message.provider?.id === currentProvider?.id &&
                message.type == "request"
              ) {
                return (
                  <Message
                    message={message}
                    provider={provider}
                    key={index}
                    rejectOffer={(message) => showModal(message, "reject")}
                    acceptOffer={(message) => showModal(message, "accept")}
                  />
                );
              } else {
                return (
                  <Message message={message} provider={provider} key={index} />
                );
              }
            })}
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
        isOpen={quoteAlert}
        type={type}
        setOpenModal={setQuoteAlert}
      />

      {activeInvoice && (
        <PaymentDrawer
          isOpen={showPaymentDrawer}
          onClose={handleClosePaymentDrawer}
          threadId={thread?.id ?? activeInvoice.threadId}
          payInvoice={payInvoice}
        />
      )}
      <RatingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitRating}
        loading={loading}
        userType={
          activeInvoice?.provider == currentProvider?.id ? "User" : "Provider"
        }
      />
    </Drawer>
  );
};

export default ChatPage;
const AcceptRejectOffer = ({ isOpen, setOpenModal }) => {
  if (isOpen === false) return null;
  const [rejectReason, setRejectReason] = useState("");
  const {
    handleWithdrawReject,
    quoteAlertType,
    setQuoteAlert,
    handleSendQuote,
    setPrice,
    setDate,
    quotemessage,
  } = useContext(ChatContext);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-md shadow-md w-2/3 mx-10">
        <div className="flex justify-between items-center ">
          <h3 className="text-lg font-semibold mb-4">
            {quoteAlertType === "accept" ? "" : "Reject Offer"}
          </h3>
          <button onClick={() => setOpenModal(false)} className="text-red-500">
            Close
          </button>
        </div>
        {quoteAlertType === "reject" && (
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
        {quoteAlertType === "accept" && (
          <p className="text-gray-500 mt-4">
            Are you sure you want to accept this offer?
          </p>
        )}
        <div className="flex justify-end mt-4">
          <div className="flex">
            <Button
              callback={() => {
                setQuoteAlert(false);
                if (quoteAlertType === "accept") {
                  setDate(quotemessage.date);
                  setPrice(quotemessage.quote);
                  handleSendQuote("accept");
                } else {
                  handleWithdrawReject(rejectReason);
                }
              }}
              text={quoteAlertType === "accept" ? "Yes" : "Submit"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
