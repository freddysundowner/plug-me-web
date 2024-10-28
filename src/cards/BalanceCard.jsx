import React, { useEffect, useState } from "react";
import { listenForUserAccountChanges } from "../services/firebaseService";
import { CurrencyFormatter } from "../utils/dateFormat";
import { useSelector } from "react-redux";
import Button from "../components/Button";
import useFormData from "../hooks/useFormData";
import usePayout from "../hooks/usePayout";

const EnterAmountToWithdraw = ({
  isOpen,
  setOpenModal,
  setRefreshTransactions,
}) => {
  const { formData, handleChange } = useFormData({ amount: 0 });
  const { loading, createPayout } = usePayout(setRefreshTransactions);

  const handleSubmit = async () => {
    await createPayout(parseFloat(formData.amount));
    setOpenModal(false);
  };
  if (isOpen === false) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-md shadow-md w-2/3 mx-10">
        <div className="flex justify-between items-center ">
          <button onClick={() => setOpenModal(false)} className="text-red-500">
            Close
          </button>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <input
            type="amount"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
          <div className="flex">
            <Button
              callback={() => {
                handleSubmit();
              }}
              text={loading ? "Submitting..." : "Submit"}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BalanceCard = ({ setRefreshTransactions }) => {
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const [showAlert, setShowAlert] = useState(false);
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    if (currentProvider?.id) {
      listenForUserAccountChanges(currentProvider.id, (user) => {
        setBalance(user.balance);
      });
    }
  }, [currentProvider]);
  return (
    <div className="mb-4 border p-4 rounded-md shadow-md justify-center items-center">
      <div className="flex flex-row items-center gap-4">
        <h4 className="text-md font-semibold">Available balance</h4>
        <p className="text-2xl text-green-500">
          <CurrencyFormatter amount={balance} />
        </p>
      </div>
      <button
        className={`mt-2 py-2 px-4  ${
          balance > 0 ? "bg-green-400 text-white" : "bg-gray-300 text-gray-700"
        }  rounded-md`}
        disabled={balance <= 0}
        onClick={() => {
          setShowAlert(true);
        }}
      >
        Withdraw
      </button>
      <EnterAmountToWithdraw
        isOpen={showAlert}
        setOpenModal={setShowAlert}
        setRefreshTransactions={setRefreshTransactions}
      />
    </div>
  );
};

export default BalanceCard;
