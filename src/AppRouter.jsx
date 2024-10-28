// AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, } from "react-router-dom";
import Home from "./pages/Home";
import OnboardingComplete from './pages/Onboarding';
import { Provider } from 'react-redux';
import { store } from "./redux/store";
const AppRouter = () => {
  return (
    <Provider store={store}><Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding-complete" element={<OnboardingComplete />} />
      </Routes>
    </Router></Provider>
  );
};

export default AppRouter;
