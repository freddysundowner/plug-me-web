import React, { useEffect, useState } from "react";
import BalanceCard from "../../cards/BalanceCard";
import { getTransactions } from "../../services/firebaseService";
import { useSelector } from "react-redux";
import { CurrencyFormatter, dateFormat } from "../../utils/dateFormat";

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  useEffect(() => {
    getTransactions(currentProvider?.id).then((transactions) => {
      setTransactions(transactions)
    })
  }, [])

  return (
    <div className="overflow-x-auto">
      <BalanceCard />
      {transactions.length == 0 ? <h2>No Transactions</h2> : <div className="overflow-y-auto h-[450px]">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left">Date</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-left">From</th>
              <th className="py-2 px-3 text-left">Amount</th>
              <th className="py-2 px-3 text-left">Ref ID</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className={`border-t `}>
                <td className="py-2 px-3">
                  {dateFormat(transaction.date.seconds * 1000)}
                </td>
                <td className={`py-2 px-3 ${transaction.status == 'pending' ? 'text-yellow-600' : ''} ${transaction?.type == "withdraw" ? "text-red-500" : ""} ${transaction?.type == "commission" ? "text-yellow-500" : ""}`}>       <p>{transaction.status}</p><span className="text-sm">{transaction.type}</span>
                </td>
                <td className="py-2 px-3">{transaction?.type == "withdraw" ? transaction?.paymentMethod : transaction.sender?.name}</td>
                <td className={`py-2 px-3 ${transaction?.type == "withdraw" ? "text-red-500" : ""} ${transaction?.type == "commission" ? "text-yellow-500" : ""}`}><CurrencyFormatter amount={transaction.amount} /></td>
                <td className="py-2">
                  {transaction.id.slice(0, 7)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
};

export default Transactions;
