import React, { useEffect, useState } from "react";
import BalanceCard from "../../cards/BalanceCard";
import { getTransactions } from "../../services/firebaseService";
import { useSelector } from "react-redux";
import { CurrencyFormatter, DateTimeDisplay } from "../../utils/dateFormat";
import { useLoading } from "../../context/LoadingContext";

const Transactions = () => {
  const { showLoading, hideLoading } = useLoading();

  const [transactions, setTransactions] = useState([]);
  const [refreshTransactions, setRefreshTransactions] = useState(false);
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  useEffect(() => {
    showLoading();
    getTransactions(currentProvider?.id).then((transactions) => {
      setTransactions(transactions);
      hideLoading();
    });
  }, [refreshTransactions]);

  return (
    <div className="overflow-x-auto">
      <BalanceCard setRefreshTransactions={setRefreshTransactions} />
      {transactions.length == 0 ? (
        <h2>No Transactions</h2>
      ) : (
        <div className="overflow-y-auto h-[450px]">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">Description</th>
                <th className="py-2 px-3 text-left">Info</th>
                <th className="py-2 px-3 text-left">Amount</th>
                <th className="py-2 px-3 text-left">Ref ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions
                .filter(
                  (transaction) =>
                    !(
                      transaction.type == "commission" &&
                      transaction?.provider?.id !== currentProvider?.id
                    )
                )
                .map((transaction, index) => (
                  <tr key={index} className={`border-t `}>
                    <td className="py-2 px-3">
                      <DateTimeDisplay
                        date={new Date(transaction.date.seconds * 1000)}
                      />
                    </td>
                    <td className={`py-2 px-3`}>
                      <p>{transaction.type}</p>
                    </td>
                    <td className="py-2 px-3">
                      {transaction?.type == "withdraw" && (
                        <>{transaction?.receiver?.type}</>
                      )}
                      {transaction?.type == "payment" && (
                        <>
                          {transaction?.receiver?.id ==
                          transaction?.provider?.id ? (
                            currentProvider?.id == transaction?.receiver?.id ? (
                              <div>
                                <div>From : {transaction?.sender?.name}</div>
                                <div>
                                  Status:
                                  <span
                                    className={`${
                                      transaction.status == "pending"
                                        ? "text-yellow-600"
                                        : ""
                                    } ${
                                      transaction?.type == "withdraw"
                                        ? "text-red-500"
                                        : ""
                                    }`}
                                  >
                                    {transaction?.status}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div>From : {transaction?.receiver?.name}</div>
                                <div>
                                  Status:{" "}
                                  <span className="text-green-500">
                                    Completed
                                  </span>
                                </div>
                              </div>
                            )
                          ) : (
                            transaction?.receiver?.name
                          )}
                        </>
                      )}
                    </td>
                    <td
                      className={`py-2 px-3 ${
                        transaction?.type == "withdraw" ? "text-red-500" : ""
                      } ${
                        transaction?.type == "commission"
                          ? "text-yellow-500"
                          : ""
                      }`}
                    >
                      <CurrencyFormatter
                        amount={
                          currentProvider?.id == transaction?.provider?.id
                            ? transaction.totalAmount ?? transaction.amount
                            : transaction?.amount
                        }
                      />
                    </td>
                    <td className="py-2">{transaction.id.slice(0, 7)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
