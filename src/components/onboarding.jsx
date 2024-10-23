import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../auth/firebaseConfig";
import { stripeAccountDetails } from '../services/httpClient';
import { updateProviderData } from '../services/firebaseService';
import { updateProvider } from '../redux/features/providerSlice';

const OnboardingComplete = () => {
    const [accountDetails, setAccountDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const fetchAccountDetails = async () => {
                        let currentUser = userDoc.data();
                        if (!currentUser?.stripeId) return;
                        try {
                            const response = await stripeAccountDetails({ accountId: currentUser?.stripeId });
                            const data = await response;
                            if (data?.status == "Completed") {
                                updateProviderData(currentUser?.id, { stripeConnected: true })
                                dispatch(updateProvider({ ...currentUser, stripeConnected: true }))
                            }
                            setAccountDetails(data);
                            setLoading(false);
                        } catch (error) {
                            console.error('Error fetching account details:', error);
                            setLoading(false);
                        }
                    };

                    fetchAccountDetails();
                }
            } else {
                dispatch(clearProvider()); // Clear user data from Redux
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full text-center">
                <div className="mb-4">
                    <svg
                        className="mx-auto h-16 w-16 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2l4 -4m0 9a9 9 0 1 0 -18 0a9 9 0 0 0 18 0z"
                        />
                    </svg>
                </div>

                {loading ?
                    <button className='inline-block px-6 py-3 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"'>Loading...</button> :
                    accountDetails?.status === "Completed" ?
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                                Onboarding Complete!
                            </h1>

                            <p className="text-gray-600 mb-8">
                                Your Stripe account has been successfully connected. You can now start
                                receiving payments and payouts!
                            </p>

                            <Link
                                to="/"
                                className="inline-block px-6 py-3 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                            >
                                Go to Dashboard
                            </Link>
                        </div> : <div className='flex gap-2 flex-col'>
                            <h2>Failed to load account details</h2>
                            <Link
                                to="/"
                                className="inline-block px-6 py-3 text-white bg-red-500 rounded-md hover:bg-red-600"
                            >
                                Try Again
                            </Link>
                        </div>}
            </div>
        </div>
    );
};

export default OnboardingComplete;
