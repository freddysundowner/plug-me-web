// Provider.js
import React, { useContext } from "react";
import {
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaEnvelope,
  FaStar,
  FaRegStar,
  FaUserCircle,
} from "react-icons/fa";
import DrawerContext, { DrawerProvider } from "../context/DrawerContext";

const Provider = ({ provider }) => {
  const { drawerState, openDrawer, closeDrawer } = useContext(DrawerContext);

  const handleRatingsClick = () => {
    console.log("handleRatingsClick", provider);
    openDrawer("providerDrawer", provider);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md lg:w-full sm:w-full pb-2"
      onClick={handleRatingsClick}
    >
      <div className="w-full flex flex-col items-center justify-center bg-gray-200 rounded-t-lg pb-2">
        <div className="flex flex-row justify-between w-full">
          <div className=" bg-primary text-white px-2 py-1 rounded-tr-md rounded-bl-md">
            <p className="text-xs">{provider.skill}</p>
          </div>
          <div className=" bg-white text-blue-600 px-2 py-1 rounded-tl-md rounded-br-md">
            <p className="text-xs">
              {provider.pricePerHour
                ? `$${provider.pricePerHour}/hr`
                : `${provider.fixedPrice}`}
            </p>
          </div>
        </div>
        <FaUserCircle className="text-gray-400 text-5xl" />

        <div className="py-1 rounded-tl-md rounded-br-md">
          <p className="text-sm ">{provider.distance} miles away</p>
        </div>
        <div className="flex items-center  cursor-pointer">
          {Array.from({ length: 5 }).map((_, index) =>
            index < provider.rating ? (
              <FaStar key={index} className="text-yellow-500" />
            ) : (
              <FaRegStar key={index} className="text-yellow-500" />
            )
          )}
          <span className="ml-2 text-gray-600 text-xs">
            ({provider.rating})
          </span>
        </div>
      </div>
      <h2 className="text-md font-semibold text-center">{provider.name}</h2>
      {/* <div className="">
        <div className="flex justify-center mt-4">
          <button className="mr-2 px-4 py-2 bg-primary text-white rounded-md shadow-md text-sm">
            Hire
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-md text-sm">
            Message
          </button>
        </div>
        <div className="flex justify-center mt-4">
          <a
            href={`https://wa.me/${provider.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-2"
          >
            <FaWhatsapp className="text-green-500 text-xl" />
          </a>
          <a
            href={`https://www.facebook.com/${provider.facebook}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-2"
          >
            <FaFacebook className="text-blue-500 text-xl" />
          </a>
          <a
            href={`https://www.linkedin.com/in/${provider.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-2"
          >
            <FaLinkedin className="text-blue-700 text-xl" />
          </a>
          <a href={`mailto:${provider.email}`} className="mr-2">
            <FaEnvelope className="text-gray-500 text-xl" />
          </a>
        </div>
      </div> */}
    </div>
  );
};

export default Provider;
