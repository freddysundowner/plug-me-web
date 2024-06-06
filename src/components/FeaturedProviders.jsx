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
    <div className="overflow-x-auto whitespace-nowrap">
      <div className="inline-flex">
        {/* <Slider {...settings}> */}
        {providers?.map((provider) => (
          <div key={provider.id} className="mx-4 md:w-[300px]">
            <ProviderCard provider={provider} />
          </div>
        ))}
        {/* </Slider> */}
      </div>
    </div>
  );
};

export default FeaturedProviders;
