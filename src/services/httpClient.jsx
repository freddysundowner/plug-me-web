// src/services/firebaseService.js
import axios from "axios";

// Set up the base URL for Axios
const apiClient = axios.create({
  baseURL: "http://127.0.0.1:3001",
  headers: {
    "Content-Type": "application/json",
  },
});
apiClient.interceptors.request.use((config) => {
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally, log them, or show messages
    return Promise.reject(error);
  }
);

export const releaseFunds = async (paymentIntentId) => {
  const response = await apiClient.post({ paymentIntentId });
  return response.data;
};

export const transferFunds = async (data) => {
  const response = await apiClient.post(data);
  return response.data;
};
export const createPayoutAccount = async (data) => {
  const response = await apiClient.post("/stripe/create-payout", data);
  return response.data;
};
export const stripeAccountDetails = async (data) => {
  const response = await apiClient.post("/stripe/get-account-status", data);
  return response.data;
};
export const createAccount = async (data) => {
  const response = await apiClient.post("/stripe/create-connected-account", data);
  return response.data;
};
export const onBoardingStripe = async (data) => {
  const response = await apiClient.post("/stripe/create-onboarding-link", data);
  return response.data;
};
export const stripeIntent = async (data) => {
  const response = await apiClient.post("/stripe/create-payment-intent", data);
  return response.data;
};
export const fetchServices = async () => {
  const response = await apiClient.get("/api/services");
  return response.data;
};

// Get place details from Google Places API
export const getPlaceDetails = async (placeId) => {
  const response = await apiClient.get("/place-details", {
    params: { placeId },
  });
  return response.data?.geometry?.location;
};

export default apiClient;
