import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import Loading from "../sharable/loading";
import ChatContext from "../context/ChatContext";

const RatingModal = ({ isOpen, onClose, onSubmit, loading, userType }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { setShowAlert } = useContext(ChatContext);

  const handleRatingChange = (value) => {
    setRating(value);
  };
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || !comment) {
      setShowAlert({
        show: true,
        error: true,
        message: "Please fill out all fields",
      });
      return;
    }
    onSubmit({ rating, comment });
    setComment("");
    setRating(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl mb-4">Rate the {userType}</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`mx-1 ${
                  value <= rating ? "text-yellow-500" : "text-gray-400"
                }`}
                onClick={() => handleRatingChange(value)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="w-full h-24 p-2 border rounded mb-4"
            placeholder="Leave a comment..."
            value={comment}
            onChange={handleCommentChange}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {loading ? <Loading color="white" /> : "Submit"}
          </button>
          <button
            type="button"
            className="ml-2 bg-gray-300 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

RatingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default RatingModal;
