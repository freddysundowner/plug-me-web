import { useContext, useState } from "react";
import { updateProviderData, addPayment } from "../services/firebaseService";
import {
  createPayoutAccount,
  createAccount,
  onBoardingStripe,
} from "../services/httpClient";
import { useSelector, useDispatch } from "react-redux";
import { updateProvider } from "../redux/features/providerSlice";
import useAlert from "./useAlert";
import ChatContext from "../context/ChatContext";

const usePayout = (setRefreshTransactions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { setShowAlert } = useContext(ChatContext);
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const dispatch = useDispatch();

  const createPayout = async (amount) => {
    if (currentProvider?.balance < amount) {
      console.log(currentProvider.balance, amount);
      setShowAlert({
        show: true,
        error: true,
        message: "You cannot withdraw more than you have",
      });
      return;
    }

    setLoading(true);
    try {
      await createPayoutAccount({ amount });
      const newBalance = currentProvider.balance - amount;
      updateProviderData(currentProvider.id, { balance: newBalance });
      dispatch(updateProvider({ ...currentProvider, balance: newBalance }));

      const transaction = {
        amount,
        timestamp: Date.now(),
        sender: { id: currentProvider.id, name: currentProvider.username },
        paymentMethod: "stripe",
        type: "withdraw",
        receiver: { id: currentProvider.id, name: currentProvider.username },
        date: new Date(),
        users: [currentProvider.id],
      };
      addPayment(transaction);

      setShowAlert({
        show: true,
        error: false,
        message: "Payment successful",
      });
      setRefreshTransactions(true);
    } catch (error) {
      setShowAlert({
        show: true,
        error: true,
        message: error?.response?.data?.error || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const stripeConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const createAccountResponse = await createAccount({
        email: currentProvider?.email,
      });

      const { accountId } = createAccountResponse;

      if (accountId) {
        dispatch(updateProvider({ ...currentProvider, stripeId: accountId }));
        updateProviderData(currentProvider?.id, { stripeId: accountId });
        const onboardingLinkResponse = await onBoardingStripe({
          accountId: accountId,
        });
        const { url } = onboardingLinkResponse;

        if (url) {
          window.location.href = url;
        } else {
          setError("Failed to generate onboarding link.");
        }
      } else {
        setError("Failed to create connected account.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return { loading, createPayout, stripeConnect, error };
};

export default usePayout;
