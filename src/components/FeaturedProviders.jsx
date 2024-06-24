// FeaturedProviders.js
import React from "react";
import ProviderCard from "../cards/Provider"; // Import the ProviderCard component
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const FeaturedProviders = ({ providers }) => {
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
  };
  return (
    <div className="grid grid-cols-2 gap-4 m-2">
      {providers?.map((provider, i) => (
        <div key={i} className="md:w-full">
          <ProviderCard provider={provider} />
        </div>
      ))}
    </div>
  );
};

export default FeaturedProviders;
