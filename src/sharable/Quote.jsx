import { useContext, useState } from "react";
import ChatContext from "../context/ChatContext";
import Select from "react-select";
import { FaTimes, FaUserCircle } from "react-icons/fa";

const Quote = ({ provider, primaryColor = "#5e60b9" }) => {
  const {
    setPrice,
    setServiceName,
    setDate,
    price,
    serviceName,
    duration,
    setDuration,
    date,
    handleSendQuote,
    setDurationUnit,
    durationUnit,
    setShowQuotePopup,
    setShowAlert,
    showQuotePopup,
  } = useContext(ChatContext);
  const handleServiceChange = (selectedOption) => {
    console.log(selectedOption);
    setServiceName(selectedOption);
  };
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: primaryColor,
      "&:hover": { borderColor: primaryColor },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? primaryColor
        : provided.backgroundColor,
      "&:hover": { backgroundColor: primaryColor, color: "white" },
      color: state.isDisabled ? "#ccc" : provided.color,
      cursor: state.isDisabled ? "not-allowed" : "default",
    }),
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-md shadow-md w-full mx-10">
        <div className="flex justify-between items-center ">
          <h3 className="text-lg font-semibold mb-4">Enter Quote Details</h3>
          <button
            onClick={() => setShowQuotePopup(!showQuotePopup)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <Select
          options={provider.services}
          onChange={handleServiceChange}
          placeholder="Select a Service"
          styles={customStyles}
          className="mb-4"
        />
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 pl-8 border rounded-md"
            placeholder="Enter price"
          />
        </div>

        <div className="w-full flex mb-4 justify-between">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="flex flex-1 p-2  border rounded-md mr-4"
            placeholder="Enter duration"
          />
          <Select
            options={[
              { value: "hourly", label: "Hourly" },
              { value: "daily", label: "Daily" },
              { value: "monthly", label: "Monthly" },
            ]}
            onChange={setDurationUnit}
            placeholder="Duration"
            className="w-[200px]"
            styles={customStyles}
          />
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 mb-4 border rounded-md"
          placeholder="Enter date (optional)"
        />

        <div className="flex justify-end">
          <button
            onClick={() => {
              handleSendQuote(provider);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Submit Quote
          </button>
        </div>
      </div>
    </div>
  );
};
export default Quote;
