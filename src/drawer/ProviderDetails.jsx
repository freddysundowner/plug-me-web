import React, { useState, useContext } from "react";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaCircle,
  FaCalendar,
} from "react-icons/fa";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import Drawer from "./Drawer";
import DrawerContext from "../context/DrawerContext";
import ChatContext from "../context/ChatContext"; // Import ChatContext for managing messages
import Socialicons from "../sharable/Socialicons";
import WorkHistory from "../sharable/WorkHistory";
import Rating from "../sharable/Rating";

const ProviderDetailsDrawer = ({ provider, isOpen, onClose }) => {
  if (!isOpen) return null;
  const [showBooking, setShowBooking] = useState(false);
  const { openDrawer } = useContext(DrawerContext);
  const { addMessage } = useContext(ChatContext); // Add this line to import addMessage from ChatContext
  

  const handleBooking = (date, slot, service) => {
    const bookingMessage = {
      id: Date.now(),
      sender: "System",
      text: `Can I book you for ${
        service.label
      } at ${slot} on ${date.toDateString()}?`,
      timestamp: new Date().toLocaleTimeString(),
      type: "quote",
      status: "pending",
    };
    addMessage(bookingMessage);
    openDrawer("chatDrawer", provider);
  };
  return (
    <Drawer
      title={provider.name}
      isOpen={isOpen}
      onClose={onClose}
      width="2xl:w-2/3 "
    >
      <div className="flex flex-col mb-6">
        <div className="flex justify-evenly items-center py-4 border-b border-gray-200">
          {provider.image ? (
            <div>
              <img
                src={provider.image}
                alt={provider.name}
                className="w-16 h-16 rounded-full object-cover shadow-lg mr-4"
              />
              <Rating rating={provider.rating} />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-t-lg flex-col">
              <FaUserCircle className="text-gray-400 text-5xl" size={80} />
              <Rating rating={provider.rating} />
            </div>
          )}
          <div>
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center text-gray-600 mr-6">
                    <FaMapMarkerAlt className="mr-2" />
                    {provider.location}
                  </div>
                </div>
                <div></div>
              </div>

              <div className="flex pt-4">
                <div className="px-6 py-2  rounded-md shadow-lg bg-gray-200 text-gray-700">
                  {provider.pricePerHour && (
                    <p className="text-gray-600">
                      Charges: ${provider.pricePerHour}/hr
                    </p>
                  )}
                  {provider.fixedPrice && (
                    <p className="text-gray-600">
                      Fixed price: ${provider.fixedPrice}
                    </p>
                  )}
                </div>
                <div className="flex items-center px-6 py-2  ">
                  <FaCircle className="mr-2 text-green-600" />
                  Available now
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between p-4 ">
          <button className="w-1/2 px-6 py-2 mr-4 bg-primary text-white rounded-md shadow-md">
            Hire
          </button>
          <button
            onClick={() => {
              openDrawer("chatDrawer", provider);
            }}
            className="w-1/2 px-6 py-2 bg-gray-200 text-gray-700 rounded-md shadow-md"
          >
            Message
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">About</h3>
            <p className="text-gray-600">{provider.description}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Services Offered</h3>
            <ul className="flex flex-wrap gap-2">
              {provider.services.map((service, index) => (
                <li
                  key={index}
                  className="px-3 py-1 bg-white text-black border border-primary rounded-full text-sm font-semibold"
                >
                  {service.value}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4"></div>
          <button
            onClick={() => {
              setShowBooking(!showBooking);
            }}
            className="w-full px-6 py-2 bg-primary text-white rounded-md shadow-md items-center flex justify-center"
          >
            <FaCalendar className="mr-2" />
            <p>Book my services</p>
          </button>

          {showBooking && (
            <AvailabilityCalendar
              provider={provider}
              onBook={handleBooking}
              primaryColor="#5e60b9"
            />
          )}
          {/* 
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Reviews</h3>
            {provider.reviews.map((review, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-center items-center">
                  {Array.from({ length: 5 }).map((_, i) =>
                    i < review.rating ? (
                      <FaStar key={i} className="text-yellow-500" />
                    ) : (
                      <FaRegStar key={i} className="text-yellow-500" />
                    )
                  )}
                  <span className="ml-2 text-gray-600 text-xs">
                    ({review.rating})
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
                <p className="text-gray-500 text-xs">- {review.author}</p>
              </div>
            ))}
          </div> */}
          <WorkHistory workHistory={provider.workHistory} />
          <Socialicons provider={provider} />
        </div>
      </div>
    </Drawer>
  );
};

export default ProviderDetailsDrawer;
