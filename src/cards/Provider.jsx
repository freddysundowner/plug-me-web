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
    openDrawer("providerDrawer", provider);
  };

  return (
    <div
      className="p-4 bg-white rounded-lg shadow-md w-80 lg:w-full sm:w-full "
      onClick={handleRatingsClick}
    >
      <div className="relative">
        {provider.image ? (
          <img
            src={provider.image}
            alt={provider.name}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-32 flex items-center justify-center bg-gray-200 rounded-t-lg">
            <FaUserCircle className="text-gray-400 text-5xl" />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-tr-md rounded-bl-md">
          <p className="text-xs font-semibold">{provider.skill}</p>
        </div>
        <div className="absolute top-2 right-2 bg-white text-blue-600 px-2 py-1 rounded-tl-md rounded-br-md">
          <p className="text-xs font-semibold">
            $
            {provider.pricePerHour
              ? `$${provider.pricePerHour}/hr`
              : `${provider.fixedPrice}`}
          </p>
        </div>
        <div className="absolute bottom-2 left-2 py-1 rounded-tl-md rounded-br-md">
          <p className="text-xs font-semibold">
            {provider.distance} miles away
          </p>
        </div>
        <div className="flex items-center absolute bottom-2 right-2 cursor-pointer">
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
      <div className="py-4">
        <h2 className="text-md font-semibold text-center">{provider.name}</h2>
        <div className="flex justify-center mt-4">
          <button className="mr-2 px-4 py-2 bg-primary text-white rounded-md shadow-md">
            Hire
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-md">
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
      </div>
    </div>
  );
};

export default Provider;
