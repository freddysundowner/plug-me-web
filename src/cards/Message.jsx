import { useContext } from "react";
import { FaCheck, FaTimesCircle } from "react-icons/fa";
import { timeAgo } from "../utils/timeAgo";
const Message = ({ message, provider, acceptOffer, rejectOffer }) => {
  return (
    <div
      className={`flex ${
        message.sender?.id === provider.id ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`p-2 my-2 rounded-md ${
          message.type === "quote"
            ? "bg-yellow-300 text-black"
            : message.type == "info"
            ? "bg-red-300"
            : message.sender?.id === provider.id
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        <p>{message.message}</p>
        <span className="text-xs text-gray-600">
          {timeAgo(message.timestamp)}
        </span>
        {message.type === "quote" && message.status === "pending" && (
          <div className="flex mt-2">
            <button
              onClick={() => {
                acceptOffer(message);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md mr-4"
            >
              <div className="flex gap-2 items-center">
                <FaCheck />
                <p>Accept</p>
              </div>
            </button>
            <button
              onClick={() => {
                rejectOffer(message);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md mr-4"
            >
              <div className="flex items-center gap-2">
                <FaTimesCircle /> <p>Reject</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Message;
