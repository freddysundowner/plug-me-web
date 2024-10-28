import { useState } from "react";
import {
  CurrencyFormatter,
  dateFormat,
  DateTimeDisplay,
} from "../utils/dateFormat";
import Rating from "./Rating";
const WorkHistory = ({ workHistory, itemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(workHistory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWorkItems = workHistory.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  return (
    <div className="my-4">
      <h3 className="text-lg font-semibold  border-b border-gray-200 mb-4">
        Work History
      </h3>
      {currentWorkItems.map((work, index) => (
        <div key={index} className="mb-4 p-4 bg-gray-100 rounded-md shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-primary">
                {work.service?.value}
              </h4>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 text-sm">
                  {dateFormat(new Date(work.date.seconds * 1000))}
                </p>
                <Rating rating={work?.rating?.rating ?? 0} />
              </div>
              <p className="text-gray-600 text-sm italic">
                {work?.rating?.comment ?? "No comment"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">
                {<CurrencyFormatter amount={work?.totalAmount ?? 0} />}
              </p>
            </div>
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
    </div>
  );
};
export default WorkHistory;
