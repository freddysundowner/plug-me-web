import React, { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

const PaginatedReviews = ({ reviews, reviewsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // Get current page reviews
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // Page change handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">Reviews</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews available</p>
      ) : (
        <>
          {currentReviews.map((review, index) => (
            <div key={index} className="mb-2 flex flex-row justify-between">
              <div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
                <p className="text-gray-500 text-xs">
                  - {review.author ?? "no user"}
                </p>
              </div>
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
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex justify-end mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 mx-1 text-sm rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white font-semibold"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PaginatedReviews;
