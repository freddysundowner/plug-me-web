import React from "react";
import { useSelector } from "react-redux";
import usePayout from "../../hooks/usePayout";

const PayoutMethods = () => {
  const { loading, stripeConnect, error } = usePayout();
  const currentUser = useSelector((state) => state.provider.currentProvider);
  return (
    <div className="mb-4 border p-4 rounded-md">
      <h4 className="text-md font-semibold">Payout Methods</h4>
      <div className="mt-2">
        <div className="flex justify-between items-center mb-2"></div>
      </div>
      <button
        onClick={() => {
          if (currentUser?.stripeConnected == false) {
            stripeConnect();
          }
        }}
        disabled={loading}
        className={`mt-2 py-2 px-4 ${
          currentUser?.stripeConnected ? "bg-green-500" : "bg-blue-500"
        } text-white rounded-md`}
      >
        {loading
          ? "Connecting with Stripe..."
          : currentUser?.stripeConnected == true
          ? "Stripe Connected"
          : "Connect with Stripe"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default PayoutMethods;
