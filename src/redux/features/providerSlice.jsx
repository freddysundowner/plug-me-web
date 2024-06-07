// features/providerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentProvider: {
    id: 1,
    name: "Provider One",
    rating: 4.5,
    distance: 10,
    skill: "Electrical Repair",
    whatsapp: "1234567890",
    facebook: "providerone",
    linkedin: "providerone",
    email: "providerone@example.com",
    pricePerHour: 50,
    description: "Expert in electrical repairs with 10 years of experience.",
    services: [
      { value: "Wiring installation", label: "Wiring installation" },
      { value: "Circuit repairs", label: "Circuit repairs" },
      { value: "Lighting installation", label: "Lighting installation" },
      { value: "Outlet installation", label: "Outlet installation" },
    ],
    location: "New York, New York",
    latitude: 40.7128,
    longitude: -74.006,
    availability: {
      weekly: [
        {
          day: "Monday",
          slots: ["9:00 AM", "11:00 AM", "1:00 PM"],
        },
        {
          day: "Wednesday",
          slots: ["9:00 AM", "11:00 AM", "1:00 PM"],
        },
      ],
      specificDates: [
        {
          date: "2024-07-15",
          slots: ["10:00 AM", "2:00 PM"],
        },
      ],
    },
    reviews: [
      {
        rating: 5,
        comment: "Excellent service.",
        author: "John Smith",
      },
      { rating: 4, comment: "Very good.", author: "Jane Doe" },
    ],
    workHistory: [
      {
        title: "Home Rewiring",
        date: "Mar 10, 2024 - Mar 12, 2024",
        feedback: "Thorough and professional.",
        price: "$200.00",
        rate: "$40.00/hr",
        hours: 5,
        review: {
          rating: 5,
          comment: "Excellent service.",
          author: "John Smith",
        },
      },
      {
        title: "Fuse Box Repair",
        date: "Apr 5, 2024 - Apr 6, 2024",
        feedback: "Quick and efficient.",
        price: "$80.00",
        rate: "$40.00/hr",
        hours: 2,
        review: {
          rating: 4,
          comment: "Very good.",
          author: "Jane Doe",
        },
      },
    ],
  },
};

const providerSlice = createSlice({
  name: "provider",
  initialState,
  reducers: {
    updateProvider: (state, action) => {
      state.currentProvider = action.payload;
    },
  },
});

export const { updateProvider } = providerSlice.actions;
export default providerSlice.reducer;
