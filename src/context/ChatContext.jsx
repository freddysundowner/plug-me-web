import React, { createContext, useState, useEffect } from "react";
import {
  addMessageToFirestore,
  updateMessageInFirestore,
  addInvoice,
  updateProviderData,
  addPayment,
} from "../services/firebaseService";
import jsPDF from "jspdf";
import { useLoading } from "./LoadingContext";
import { useSelector } from "react-redux";
import { dateFormat } from "../utils/dateFormat";
import { useDispatch } from "react-redux";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [visiblePopupMessages, setVisiblePopupMessages] = useState([]);
  const [durationUnit, setDurationUnit] = useState("hours");
  const [showQuotePopup, setShowQuotePopup] = useState(false);
  const [quoteAlert, setQuoteAlert] = useState(false);
  const [quoteAlertType, setQuoteAlertType] = useState("");
  const { showLoading, hideLoading } = useLoading();
  const [quotemessage, setQuoteMessage] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { invoices, setInvoices } = useState([]);
  const [taskBoardOpen, setIsTaskBoardOpen] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const dispatch = useDispatch();
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "All fields are require",
    error: true,
  }); //TO BE REMOVED
  const [price, setPrice] = useState("");
  const [serviceName, setServiceName] = useState(null);
  const [date, setDate] = useState(Date.now());
  const [duration, setDuration] = useState("");
  const [messages, setMessages] = useState([]);
  const [inbox, setInbox] = useState([]);
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );

  const addMessage = async (message) => {
    await addMessageToFirestore(message);
  };
  const generateReceipePDF = (title = "Receipt", thread = null) => {
    let newQuote = quotemessage;
    const doc = new jsPDF();
    console.log(thread);
    if (thread != null) {
      const filteredMessages = messages.filter(
        (msg) =>
          String(msg?.threadId) === String(thread) &&
          msg?.type == "quote" &&
          msg.paid == true
      );
      console.log(messages);
      newQuote = filteredMessages[0];
    }

    // Add title and other details
    doc.setFontSize(18);
    doc.text(title, 105, 20, null, null, "center");

    doc.setFontSize(12);
    doc.text(`Date: ${dateFormat(newQuote.date?.seconds * 1000)}`, 14, 40);
    if (newQuote?.slot?.from && newQuote?.slot?.to) {
      doc.text(`From: ${newQuote?.slot?.from}`, 14, 50);
      doc.text(`To: ${newQuote?.slot?.to}`, 14, 60);
    }

    // Add quotation details in a table
    const quoteData = [
      ["Description", "Value"],
      ["Service", newQuote.service.value],
      ["Price", `$${newQuote.quote}`],
    ];

    doc.autoTable({
      startY: 70,
      head: [quoteData[0]],
      body: quoteData.slice(1),
      styles: { fontSize: 10, halign: "center", valign: "middle" },
      theme: "striped",
    });
    doc.text(
      `Paid Via: ${newQuote.paidVia}`,
      14,
      doc.autoTable.previous.finalY + 20
    );
    doc.text(
      "Thank you for showing interest in our service.",
      14,
      doc.autoTable.previous.finalY + 30,
      { maxWidth: 180 }
    );

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfData(pdfUrl);
    setModalIsOpen(true);
  };
  const generatePDF = (title = "Quotation", thread = null) => {
    let newQuote = quotemessage;
    const doc = new jsPDF();
    if (thread != null) {
      const filteredMessages = messages.filter(
        (msg) =>
          String(msg?.threadId) === String(thread) &&
          msg?.type == "quote" &&
          msg.paid == false
      );
      newQuote = filteredMessages[0];
    }
    doc.setFontSize(18);
    doc.text(title, 105, 20, null, null, "center");

    doc.setFontSize(12);
    doc.text(`Date: ${dateFormat(newQuote.date?.seconds * 1000)}`, 14, 40);
    if (newQuote?.slot?.from && newQuote?.slot?.to) {
      doc.text(`From: ${newQuote?.slot?.from}`, 14, 50);
      doc.text(`To: ${newQuote?.slot?.to}`, 14, 60);
    }

    // Add quotation details in a table
    const quoteData = [
      ["Description", "Value"],
      ["Service", newQuote.service.value],
      ["Price", `$${newQuote.quote}`],
    ];

    doc.autoTable({
      startY: 70,
      head: [quoteData[0]],
      body: quoteData.slice(1),
      styles: { fontSize: 10, halign: "center", valign: "middle" },
      theme: "striped",
    });

    // Add message
    doc.text("Message:", 14, doc.autoTable.previous.finalY + 20);
    doc.text(
      "Thank you for showing interest in our service.",
      14,
      doc.autoTable.previous.finalY + 30,
      { maxWidth: 180 }
    );

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfData(pdfUrl);
    setModalIsOpen(true);
  };
  const payInvoice = async (threadId) => {
    const invoiceRes = messages.filter(
      (msg) =>
        String(msg?.threadId) === String(threadId) &&
        msg?.type === "quote" &&
        msg?.paid === false
    );

    if (invoiceRes.length === 0) return;

    const invoice = invoiceRes[0];
    const amount = invoice?.quote;

    try {

      addMessage({
        sender: {
          id: currentProvider?.id,
          name: currentProvider?.username,
        },
        receiver: {
          id: invoice?.provider?.id,
          name: invoice?.provider?.name,
        },
        provider: invoice?.provider,
        amount: amount * 0.9,
        date: new Date(),
        message: "Payment successful",
        timestamp: Date.now(),
        type: "progress",
        users: [currentProvider?.id, invoice?.provider?.id],
        threadId: invoice?.threadId,
      });

      // updateMessageInFirestore(threadId, invoice.id, payload);

      //save payment
      const transaction = {
        amount: amount * 0.9,
        totalAmount: amount,
        timestamp: Date.now(),
        sender: {
          id: currentProvider?.id,
          name: currentProvider?.username,
        },
        provider: invoice?.provider,
        paymentMethod: "stripe",
        status: "pending",
        type: "payment",
        receiver: invoice?.provider,
        date: new Date(),
        users: [invoice?.provider?.id, invoice?.client?.id],
        invoiceId: invoice?.id,
        threadId: invoice?.threadId,
      };
      addPayment(transaction);

      updateProviderData(invoice?.sender?.id, {
        "currentInvoice.paid": true,
        "currentInvoice.released": false,
        "currentInvoice.amount": amount,
      });
      updateProviderData(invoice?.receiver?.id, {
        "currentInvoice.paid": true,
        "currentInvoice.released": false,
        "currentInvoice.amount": amount,
      });

      console.log("Payment successful and invoice marked as paid!");
      return { success: true };
      // }
    } catch (error) {
      console.error("Error processing payment:", error);
      return { success: false, error: "Payment processing failed" };
    }
  };

  const handleSendQuote = async (type) => {
    console.log(quotemessage);
    if (quotemessage.quote <= 0) {
      setShowAlert({
        show: true,
        message: "Please enter a valid price",
        error: true,
      });
      return;
    }
    if (date == undefined) {
      setShowAlert({
        show: true,
        message: "Please enter a valid date",
        error: true,
      });
      return;
    }
    if (quotemessage?.service?.value?.trim()) {
      showLoading(true);
      const message = {
        sender: {
          id: currentProvider.id,
          username: currentProvider.username,
          photoURL: currentProvider?.photoURL ?? null,
        },
        receiver: quotemessage?.receiver,
        timestamp: Date.now(),
        users: [currentProvider.id, quotemessage?.receiver.id],
        type: "message",
      };
      if (type === "update") {
        await updateMessageInFirestore(quotemessage.threadId, quotemessage.id, {
          status: "updated",
          message: `Hi ${
            quotemessage?.sender?.username
          }, Quotation for ${quotemessage?.service?.value?.trim()} on ${date} from ${
            quotemessage?.slot?.from
          } to ${quotemessage?.slot?.to} has been updated.`,
          quote: quotemessage?.quote,
        });
        await addMessage({
          ...message,
          message: "Quotation Updated",
        });
      } else if (type === "withthdraw") {
        await updateMessageInFirestore(quotemessage.threadId, quotemessage.id, {
          status: "withdrawn",
          message: `Hi ${
            quotemessage?.sender?.username
          }, Quotation for ${quotemessage?.service?.value?.trim()} on ${date} from ${
            quotemessage?.slot?.from
          } to ${quotemessage?.slot?.to} has been withdrawn.`,
        });
        await addMessage({
          ...message,
          message: "Quotation Updated",
        });
      } else if (type === "accept") {
        await updateMessageInFirestore(quotemessage.threadId, quotemessage.id, {
          status: "accepted",
          message: `Hi ${
            quotemessage?.sender?.username
          }, Quotation for ${quotemessage?.service?.value?.trim()} on ${date} from ${
            quotemessage?.slot?.from
          } to ${quotemessage?.slot?.to} has been accepted.`,
          type: "quote",
        });
        await addInvoice(quotemessage.provider, {
          threadId: quotemessage.threadId,
          invoiceId: quotemessage.id,
          status: "pending",
          client: quotemessage?.client,
          date: new Date(),
        });
      } else if (type === "reject") {
        await updateMessageInFirestore(quotemessage.threadId, quotemessage.id, {
          status: "rejected",
          message: `Hi ${
            quotemessage?.sender?.username
          }, Quotation for ${quotemessage?.service?.value?.trim()} on ${date} from ${
            quotemessage?.slot?.from
          } to ${quotemessage?.slot?.to} has been declined.`,
        });
        await addMessage({
          ...message,
          message: "Quotation Updated",
        });
      } else {
        await addMessage({
          ...message,
        });
        // await updateMessageInFirestore(quotemessage.threadId, quotemessage.id, {
        //   status: "accepted",
        // });
      }
      setShowQuotePopup(false);
      hideLoading(true);
    } else {
      setShowAlert({
        show: true,
        message: "All fields are required",
        error: true,
      });
    }
  };

  // Inside handleRejectBooking function
  const handleWithdrawReject = async (reason) => {
    if (reason.trim() === "") {
      setShowAlert({
        show: true,
        message: "Please enter a reason for rejection",
        error: true,
      });
      return;
    }
    showLoading(true);
    await updateMessageInFirestore(quotemessage.threadId, quotemessage.id, {
      status: "rejected",
      message: reason,
    });

    const message = {
      sender: {
        id: currentProvider.id,
        username: currentProvider.username,
        photoURL: currentProvider?.photoURL ?? null,
      },
      receiver: quotemessage?.sender,
      timestamp: Date.now(),
      users: [currentProvider.id, quotemessage?.sender.id],
      type: "message",
    };
    await addMessage({
      ...message,
      message: "Quotation Rejected",
    });
    setShowQuotePopup(false);
    hideLoading(true);
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
        setMessages,
        inbox,
        setInbox,
        quotemessage,
        setQuoteMessage,
        quoteAlert,
        setQuoteAlert,
        quoteAlertType,
        setQuoteAlertType,
        handleWithdrawReject,
        date,
        generatePDF,
        taskBoardOpen,
        setIsTaskBoardOpen,
        pdfData,
        setPdfData,
        modalIsOpen,
        invoices,
        setInvoices,
        setModalIsOpen,
        payInvoice,
        generateReceipePDF,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
