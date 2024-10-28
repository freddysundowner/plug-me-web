import { useContext, useEffect, useState } from "react";
import ChatContext from "../context/ChatContext";
import Select from "react-select";
import { FaTimes, FaCheck } from "react-icons/fa";
import Loading from "../sharable/loading";
import Button from "../components/Button";
import { useSelector } from "react-redux";
import { TimePicker } from "antd";
import moment from "moment"; // Import moment for handling time
import CustomDatePicker from "../sharable/DatePicker";

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
    setQuoteMessage,
    showQuotePopup,
    loading,
  } = useContext(ChatContext);

  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );

  const handleServiceChange = (selectedOption) => {
    setQuoteMessage({ ...quotemessage, service: selectedOption });
  };
  useEffect(() => {
    setPrice(quotemessage?.quote);
    setServiceName(quotemessage?.service);
    setDuration(quotemessage?.duration);
    setDurationUnit(quotemessage?.durationUnit);
  }, [quotemessage]);
  console.log(quotemessage);
  useEffect(() => {
    setQuoteMessage({
      ...quotemessage,
      provider:
        currentProvider?.isProvider == true
          ? currentProvider?.id
          : provider?.id,
      receiver: provider,
    });
  }, []);

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
        <h4>Service</h4>
        {quotemessage?.id ? (
          <div className=" w-1/2 text-center self-center px-3 mb-4 py-1 text-white bg-primary  border border-primary rounded-full text-sm font-semibold">
            {quotemessage?.service?.value}
          </div>
        ) : (
          <Select
            options={currentProvider.services}
            onChange={handleServiceChange}
            placeholder="Select a Service"
            styles={customStyles}
            className="mb-4"
          />
        )}
        <h4>Date</h4>
        <div>
          <CustomDatePicker selectedDate={date} setSelectedDate={setDate} />
        </div>

        <h4>Time Slot</h4>
        {quotemessage.service?.availability?.map((currentAvailability, index) =>
          currentAvailability?.slots.map((slot, slotIndex) => (
            <div key={slotIndex} className="flex items-center mb-2">
              <TimePicker
                className="w-full"
                use12Hours
                format="h:mm a"
                placeholder="From"
                value={slot.from ? moment(slot.from, "h:mm a") : null}
                onChange={(time, timeString) => {
                  const newSlots = [...currentAvailability[index].slots];
                  newSlots[slotIndex].from = timeString;
                }}
              />
              <span className="mx-2">to</span>
              <TimePicker
                className="w-full"
                use12Hours
                format="h:mm a"
                placeholder="To"
                value={slot.to ? moment(slot.to, "h:mm a") : null}
                onChange={(time, timeString) => {
                  const newSlots = [...currentAvailability[index].slots];
                  newSlots[slotIndex].to = timeString;
                }}
              />
              <button
                type="button"
                className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                onClick={() => {
                  currentAvailability?.slots.splice(slotIndex, 1);
                }}
              >
                Remove
              </button>
            </div>
          ))
        )}

        {quotemessage?.slot && (
          <div className=" w-1/2 text-center self-center px-3 mb-4 py-1 text-white bg-primary  border border-primary rounded-full text-sm font-semibold">
            {`${quotemessage?.slot.from} - ${quotemessage?.slot.to}`}
            {quotemessage?.slot.from && (
              <FaCheck className="inline ml-2 text-white" />
            )}
          </div>
        )}
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

        <div className="flex justify-end">
          <Button
            callback={() => {
              if (quotemessage?.type == "request") {
                setQuoteMessage({ ...quotemessage, quote: quotemessage.quote });
                handleSendQuote("update");
              } else {
                handleSendQuote();
              }
            }}
            loading={loading}
            text={
              quotemessage?.type == "request" ? "Confirm Quote" : "Send Quote"
            }
          />
        </div>
      </div>
    </div>
  );
};
export default Quote;
