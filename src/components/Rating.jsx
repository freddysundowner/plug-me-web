import { FaStar, FaRegStar } from "react-icons/fa";
const Rating = ({ rating }) => (
  <div className="flex justify-center items-center  ml-4">
    {Array.from({ length: 5 }).map((_, index) =>
      index < rating ? (
        <FaStar key={index} className="text-yellow-500" />
      ) : (
        <FaRegStar key={index} className="text-yellow-500" />
      )
    )}
    <span className="ml-2 text-gray-600 text-xs">({rating})</span>
  </div>
);
export default Rating;
