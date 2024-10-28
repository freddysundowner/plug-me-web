import React, { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaCircle,
  FaRegStar,
  FaStar,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import AvailabilityCalendar from "../components/AvailabilityCalendar";
import Drawer from "./Drawer";
import Socialicons from "../sharable/Socialicons";
import WorkHistory from "../components/WorkHistory";
import Rating from "../components/Rating";
import { CurrencyFormatter } from "../utils/dateFormat";
import { getInvoice, getUserRatings } from "../services/firebaseService";

const ProviderDetailsDrawer = ({ provider, isOpen, onClose }) => {
  if (!isOpen) return null;
  const [showBooking, setShowBooking] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getUserRatings(provider.id).then((ratings) => {
      if (ratings) {
        setReviews(ratings);
      }
    });
    getInvoice(provider?.id).then((invoices) => {
      console.log(invoices);
      
      setTasks(invoices);
    });
  }, [provider]);
  

  const averageRating =
    provider.ratingsCount > 0
      ? Math.round(provider.totalRatings / provider.ratingsCount)
      : 0;
  return (
    <Drawer
      title={provider.username}
      isOpen={isOpen}
      onClose={onClose}
      width="2xl:w-2/3 xl:w-1/2 2xl:w-1/2 3xl:w-1/2 h-full lg:w-2/3 md:w-2/3 sm:w-full"
      showheader={false}
    >
      <div className="flex flex-col mb-16 justify-evenly">
        <div className="flex items-center py-4 border-b border-gray-200 justify-between">
          {provider.image ? (
            <div>
              <img
                src={provider.image}
                alt={provider.username}
                className="w-16 h-16 rounded-full object-cover shadow-lg mr-4"
              />
              <Rating rating={provider.rating} />
            </div>
          ) : (
            <div className="flex items-center  rounded-t-lg flex-row gap-11">
              <div className="relative">
                <FaUserCircle className="text-gray-400 text-5xl" size={80} />
                <MdVerified
                  size={20}
                  className={`absolute top-0 right-2 ${
                    provider?.verified == true
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                />
              </div>
              <div className="flex cursor-pointer flex-col gap-1">
                <h2 className="text-xl font-semibold">{provider.username}</h2>
                <div className="flex items-center text-gray-600 mr-6">
                  <FaMapMarkerAlt className="mr-2" />
                  {provider.location}
                </div>
                <div className="flex flex-row">
                  {Array.from({ length: 5 }).map((_, index) =>
                    index < averageRating ? (
                      <FaStar key={index} className="text-yellow-500" />
                    ) : (
                      <FaRegStar key={index} className="text-yellow-500" />
                    )
                  )}
                  <span className="ml-2 text-gray-600 text-xs">
                    ({provider.ratingsCount})
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-sm">
                    {" "}
                    Distance: {provider.distance} miles away
                  </p>
                </div>

                <div>
                  {provider.online ? (
                    <div className="flex items-center text-gray-600">
                      <FaCircle className="mr-2" />
                      Available Now
                    </div>
                  ) : provider?.loggedOut == true ? (
                    <div className="flex items-center text-gray-600">
                      <FaCircle className="mr-2" />
                      Offline
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <FaCircle className="mr-2" />
                      Away
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <span>
                  <CurrencyFormatter amount={provider?.totalEarnings ?? 0} />+
                  Total earnings
                </span>
                <span>{provider?.totalTasks ?? 0} Total tasks</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">About</h3>
            <p className="text-gray-600">{provider.description}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">My skills</h3>
            <ul className="flex flex-wrap gap-2">
              {provider.services.map((service, index) => (
                <li
                  key={index}
                  className="px-3 py-1 bg-white text-black border border-primary rounded-full text-sm font-semibold"
                >
                  {service.label}
                </li>
              ))}
            </ul>
          </div>
          {/* <div className="mb-4 flex gap-4">
            <button
              onClick={() => {
                setShowBooking(!showBooking);
              }}
              className="w-full px-6 py-2 bg-primary text-white rounded-md shadow-md items-center flex justify-center"
            >
              <FaCalendar className="mr-2" />
              <p>Request a Quote</p>
            </button>

            <button
              onClick={() => {
                closeDrawer("providerDrawer");
                if (!currentUser) {
                  openDrawer("loginDrawer");
                  return;
                }
                openDrawer("chatDrawer", provider);
              }}
              className="w-1/2 px-6 py-2 bg-gray-200 text-gray-700 rounded-md shadow-md"
            >
              <div className="flex items-center gap-4 justify-center">
                <FaRocketchat />
                <p>Message Me</p>
              </div>
            </button>
          </div> */}

          {showBooking && (
            <AvailabilityCalendar provider={provider} primaryColor="#5e60b9" />
          )}

          {/* <PaginatedReviews reviews={reviews} reviewsPerPage={5} /> */}
          {tasks.length == 0 ? (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Work History</h3>
              <p className="text-gray-600">No work history available</p>
            </div>
          ) : (
            <WorkHistory workHistory={tasks} />
          )}
          <Socialicons provider={provider} />
        </div>
      </div>
    </Drawer>
  );
};

export default ProviderDetailsDrawer;
