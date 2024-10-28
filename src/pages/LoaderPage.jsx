import React from "react";
import { useLoading } from "../context/LoadingContext";

const LoaderPage = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );
};

export default LoaderPage;
