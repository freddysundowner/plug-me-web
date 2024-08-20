// FeaturedProviders.js
import React from "react";
import ProviderCard from "../cards/Provider"; // Import the ProviderCard component
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector } from "react-redux";
const FeaturedProviders = () => {
  const providers = useSelector((state) => state.provider.providers);
  
  return (
    <div className="grid grid-cols-2 gap-4 m-2">
      {providers.length == 0 ? (
        <h2 className="text-center text-xl font-bold">No providers found.</h2>
      ) : (
        providers?.map((provider, i) => (
          <div key={i} className="md:w-full">
            <ProviderCard provider={provider} />
          </div>
        ))
      )}
    </div>
  );
};

export default FeaturedProviders;
