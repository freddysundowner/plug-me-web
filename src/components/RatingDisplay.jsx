import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

const RatingDisplay = ({ rating, comment }) => (
  <div className="flex items-center cursor-pointer">
    {Array.from({ length: 5 }).map((_, index) =>
      index < rating ? (
        <FaStar key={index} className="text-yellow-500" />
      ) : (
        <FaRegStar key={index} className="text-yellow-500" />
      )
    )}
    <span className="text-gray-600 text-xs"> ({rating ?? 0})</span>
    <p className="text-gray-600 text-xs mt-1">{comment}</p>
  </div>
);

export default RatingDisplay;
