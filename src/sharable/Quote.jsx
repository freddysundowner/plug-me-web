import { useContext, useEffect, useState } from "react";
import ChatContext from "../context/ChatContext";
import Select from "react-select";
import { FaTimes, FaCheck } from "react-icons/fa";
import Loading from "./loading";

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
    quotemessage,
    setShowQuotePopup,
    setShowAlert,
    showQuotePopup, loading
  } = useContext(ChatContext);

  useEffect(() => {
    setPrice(quotemessage?.quote);
    setServiceName(quotemessage?.service);
    setDuration(quotemessage?.duration);
    // setDate(handleDateFormat(quotemessage?.date.seconds * 1000));
    setDurationUnit(quotemessage?.durationUnit);
  }, [quotemessage]);
  const handleDateFormat = (date) => {
    const dateObj = new Date(date);
    // const year = newDate.getFullYear();
    // const month = newDate.getMonth() + 1;
    // const day = newDate.getDate();
    // console.log(`${day}-${month}-${year}`);

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const year = dateObj.getFullYear();

    // Format the date as dd/mm/yyyy
    const formattedDate = `${day}/${month}/${year}`;
    // console.log(`${day}-${month}-${year}`);

    return formattedDate;
  }

  // console.log(quotemessage);

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
          <h3 className="text-lg font-semibold mb-4">Quote Details</h3>
          <button
            onClick={() => setShowQuotePopup(!showQuotePopup)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <div
          className=" w-1/2 text-center self-center px-3 mb-4 py-1 text-white bg-primary  border border-primary rounded-full text-sm font-semibold"
        >
          {quotemessage?.service?.value}
        </div>
        <h4>Time Slot</h4>

        {quotemessage?.slot && <div
          className=" w-1/2 text-center self-center px-3 mb-4 py-1 text-white bg-primary  border border-primary rounded-full text-sm font-semibold"
        >
          {`${quotemessage?.slot.from} - ${quotemessage?.slot.to}`}
          {quotemessage?.slot.from && (
            <FaCheck className="inline ml-2 text-white" />
          )}
        </div>}
        <div className="w-full flex mb-4 justify-between">
          <div className="relative mr-4 flex flex-1 ">
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
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 mb-4 border rounded-md"
          placeholder="Enter date (optional)"
        />

        <div className="flex justify-end">

          {loading ? (
            <div className="flex justify-center">
              <button
                type="button"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                <Loading color="white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                  if (quotemessage?.type == "quote") {  
                    handleSendQuote("update");
                  } else {
                    handleSendQuote();
                  }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              {
                quotemessage?.type == "quote" ? "Update Quote" : "Send Quote"
              }
            </button>)}
        </div>
      </div>
    </div>
  );
};
export default Quote;
