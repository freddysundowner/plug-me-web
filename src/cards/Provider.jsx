import React, { useContext } from "react";
import {
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaEnvelope,
  FaStar,
  FaRegStar,
  FaUserCircle,
  FaCircle,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import DrawerContext from "../context/DrawerContext";

const Provider = ({ provider }) => {
  const { openDrawer } = useContext(DrawerContext);
  const handleRatingsClick = () => {
    openDrawer("providerDrawer", provider);
  };
  const averageRating =
    provider.ratingsCount > 0
      ? Math.round(provider.totalRatings / provider.ratingsCount)
      : 0;

  return (
    <div
      className="bg-white rounded-lg shadow-md lg:w-full sm:w-full pb-2 w-full"
      onClick={handleRatingsClick}
    >
      <div className="w-full flex flex-col items-center justify-center bg-gray-200 rounded-t-lg pb-2">
        <div className="flex flex-row justify-between w-full p-2 text-primary">
          <MdVerified size={20} />
          <div className="flex items-center">
            <FaCircle
              className={`mr-2 ${
                provider?.online == true
                  ? "text-green-500"
                  : provider?.loggedOut == true
                  ? "text-gray-500"
                  : "text-yellow-500"
              } `}
            />
          </div>
        </div>
        <FaUserCircle className="text-gray-400 text-5xl" />
        <div className="py-1 rounded-tl-md rounded-br-md">
          <p className="text-sm ">
            {provider.distance > 0 ? provider.distance + "miles away" : "n/a"}
          </p>
        </div>

        <div className="flex items-center  cursor-pointer">
          {Array.from({ length: 5 }).map((_, index) =>
            index < averageRating ? (
              <FaStar key={index} className="text-yellow-500" />
            ) : (
              <FaRegStar key={index} className="text-yellow-500" />
            )
          )}
          <span className="ml-2 text-gray-600 text-xs">
            ({provider.ratingsCount ?? 0})
          </span>
        </div>
      </div>
      <h2 className="text-md font-semibold text-center py-2">
        {provider.username}
      </h2>
      <div className="overflow-x-auto whitespace-nowrap">
        {provider.services.map((service, index) => (
          <div
            key={index}
            className="inline-block bg-primary text-white px-2 py-1 rounded-tr-md rounded-bl-md mx-1"
          >
            <p className="text-xs">{service.label}</p>
          </div>
        ))}
      </div>

      <div className="">
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
