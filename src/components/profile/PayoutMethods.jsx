import React, { useState } from "react";
import { createAccount, onBoardingStripe, stripeIntent } from "../../services/httpClient";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateProvider } from "../../redux/features/providerSlice";
import { updateProviderData } from "../../services/firebaseService";
const WithdrawButton = ({ amount, accountId }) => {
  const handleWithdraw = async () => {
    const response = await fetch('/create-payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, accountId }),
    });
    const data = await response.json();
    if (data.payout) {
      alert('Payout Successful');
    } else {
      alert('Payout Failed');
    }
  };

  return <button onClick={handleWithdraw}>Withdraw to Bank</button>;
};

const PayoutMethods = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = useSelector(
    (state) => state.provider.currentProvider
  );
  const handleStripeConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create a Connected Account
      const createAccountResponse = await createAccount({ email: currentUser?.email });

      const { accountId } = createAccountResponse;

      if (accountId) {
        dispatch(updateProvider({ ...currentUser, stripeId: accountId }))
        console.log({ stripeId: accountId }, currentUser?.id);
        updateProviderData(currentUser?.id, { stripeId: accountId })
        const onboardingLinkResponse = await onBoardingStripe({ accountId: accountId });
        const { url } = onboardingLinkResponse;

        if (url) {
          // Step 3: Redirect the provider to Stripe's onboarding form
          window.location.href = url;
        } else {
          setError('Failed to generate onboarding link.');
        }
      } else {
        setError('Failed to create connected account.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mb-4 border p-4 rounded-md">
      <h4 className="text-md font-semibold">Payout Methods</h4>
      {/* <p className="text-gray-500">
        To change which method is preferred, edit your withdrawal schedule.
      </p> */}
      <div className="mt-2">
        {/* <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/M-PESA_LOGO.png/1200px-M-PESA_LOGO.png"
              alt="M-PESA"
              className="w-8 h-8 mr-2"
            />
            <p className="text-gray-500">M-PESA ending in 3474</p>
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
              Preferred
            </span>
          </div>
          <div className="flex items-center">
            <button className="text-blue-500 mr-2">Edit</button>
            <button className="text-red-500">Remove</button>
          </div>
        </div> */}
        <div className="flex justify-between items-center mb-2">
          {/* <div className="flex items-center">
            <img
              src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
              alt="PayPal"
              className="w-8 h-8 mr-2"
            />
            <p className="text-gray-500">PayPal - reggycodas254@gmail.com</p>
          </div> */}
          {/* <button className="text-red-500">Remove</button> */}
        </div>
      </div>
      <button onClick={() => {
        if (currentUser?.stripeConnected == false) { handleStripeConnect() }
      }} disabled={loading} className={`mt-2 py-2 px-4 ${currentUser?.stripeConnected ? 'bg-green-500' : 'bg-blue-500'} text-white rounded-md`}>
        {loading ? 'Connecting with Stripe...' : currentUser?.stripeConnected == true ? "Stripe Connected" : 'Connect with Stripe'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default PayoutMethods;
