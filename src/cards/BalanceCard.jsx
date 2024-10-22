import React, { useEffect, useState } from "react";
import { listenForUserAccountChanges } from "../services/firebaseService";
import { CurrencyFormatter } from "../utils/dateFormat";
import { useSelector } from "react-redux";

const BalanceCard = () => {
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const [balance, setBalance] = useState(0)
  useEffect(() => {
    if (currentProvider?.id) {
      listenForUserAccountChanges(currentProvider.id, (user) => {
        setBalance(user.balance)
      });
    }
  }, [currentProvider]);
  return (
    <div className="mb-4 border p-4 rounded-md shadow-md justify-center items-center">
      <div className="flex flex-row items-center gap-4">
        <h4 className="text-md font-semibold">Available balance</h4>
        <p className="text-2xl text-green-500"><CurrencyFormatter amount={balance} /></p>
      </div>
      <button
        className={`mt-2 py-2 px-4  ${balance > 0 ? 'bg-green-400 text-white' : "bg-gray-300 text-gray-700"}  rounded-md`}
        disabled={balance <= 0}

      >
        Withdraw
      </button>
    </div>
  );
};

export default BalanceCard;
