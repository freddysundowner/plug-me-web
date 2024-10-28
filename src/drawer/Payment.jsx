import React, { useContext, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import Drawer from "./Drawer"; // Reusable drawer component
import Button from "../components/Button"; // Reusable Button component
import ChatContext from "../context/ChatContext";
import { stripeIntent } from "../services/httpClient";

const Payment = ({ isOpen, onClose, threadId, payInvoice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { messages } = useContext(ChatContext);
  const handleChange = (event) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handlePayInvoice = async () => {
    if (!stripe || !elements) {
      console.error("Stripe has not loaded yet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invoiceRes = messages.filter(
        (msg) =>
          String(msg?.threadId) === String(threadId) &&
          msg?.type === "quote" &&
          msg?.paid === false
      );

      if (invoiceRes.length === 0) return;

      const invoice = invoiceRes[0];
      const amount = invoice?.quote;
      const response = await stripeIntent({ amount });
      //
      console.log(response);
      const { clientSecret } = response;
      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        setError(`Payment failed: ${error.message}`);
        setLoading(false);
        return;
      }
      console.log(paymentIntent);

      if (paymentIntent.status === "succeeded") {
        await payInvoice(threadId);
        onClose();
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setError("Error processing payment");
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Deposit Escrol"
      isOpen={isOpen}
      onClose={onClose}
      width="w-2/3"
      showIcon={false}
      subText="Escrol amount is not paid directly to provider, its stored in plugme holding account untill you are satisifed and you release it to the provider"
    >
      <div className="p-4 flex flex-col">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="w-full max-w-md mx-auto mb-4">
          <div className="relative bg-white rounded-lg shadow-md border border-gray-300 px-6 py-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Credit Card Information
            </label>
            <div className="relative">
              <CardElement
                onChange={handleChange}
                options={{
                  style: {
                    base: {
                      color: "#32325d",
                      fontSize: "16px",
                      fontSmoothing: "antialiased",
                      "::placeholder": {
                        color: "#a0aec0", // Lighter placeholder color
                      },
                    },
                    invalid: {
                      color: "#e53e3e", // Tailwind's red for error states
                      iconColor: "#e53e3e",
                    },
                  },
                }}
                className="p-4 bg-gray-100 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <Button
          callback={handlePayInvoice}
          text={loading ? "Processing..." : "Deposit"}
          disabled={loading}
        />
      </div>
    </Drawer>
  );
};

export default Payment;
