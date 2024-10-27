import React, { useState, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCheck } from "react-icons/fa";
import Select from "react-select";
import moment from "moment";
import ChatContext from "../context/ChatContext";
import DrawerContext from "../context/DrawerContext";
import { useSelector } from "react-redux";
import { CurrencyFormatter } from "../utils/dateFormat";
import { parse } from "date-fns";

const AvailabilityCalendar = ({ provider, primaryColor }) => {
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const { addMessage } = useContext(ChatContext);
  const [date, setDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [quote, setQuote] = useState(null);
  const [counterOffers, setCounterOffers] = useState([]);
  const [finalQuote, setFinalQuote] = useState(null);
  const [customPrice, showCustomPrice] = useState(false);

  const { openDrawer, closeDrawer } = useContext(DrawerContext);
  const { setShowAlert } = useContext(ChatContext);
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (selectedService?.priceType == "perHour") {
      setSelectedSlot(null);
      setQuote(null);
      setFinalQuote(null);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    if (selectedService) {
      calculateQuote(selectedService, slot);
    }
  };

  const handleServiceChange = (selectedOption) => {
    setSelectedService(selectedOption);
    if (selectedOption?.priceType == "fixed") {
      calculateQuote(selectedOption, selectedSlot);
    } else {
      setDate(new Date());
      setSelectedSlot(null);
      setQuote(null);
      setFinalQuote(null);
    }
  };

  const calculateQuote = (service, slot) => {
    const { price, priceType } = service;
    console.log(service);

    if (priceType === "perHour") {
      const fromTime = moment(slot.from, "h:mm a");
      const toTime = moment(slot.to, "h:mm a");
      const duration = moment.duration(toTime.diff(fromTime));
      const hours = duration.asHours();
      const totalQuote = hours * price;
      setQuote(parseFloat(totalQuote.toFixed(2)));
      generateCounterOffers(totalQuote);
    } else {
      setQuote(parseFloat(price));
      // generateCounterOffers(price);
    }
  };

  const generateCounterOffers = (basePrice) => {
    const offer1 = basePrice * 0.9;
    const offer2 = basePrice * 0.95;
    const offer3 = basePrice * 1.05;
    setCounterOffers([offer1.toFixed(2), offer2.toFixed(2), offer3.toFixed(2)]);
  };

  const handleCounterOfferSelect = (offer) => {
    setFinalQuote(parseFloat(offer));
  };

  const handleBooking = () => {
    if (!currentProvider) {
      closeDrawer("providerDrawer");
      openDrawer("loginDrawer", provider);
      return;
    }
    if (finalQuote === null) {
      setShowAlert({
        show: true,
        message: "Please select an amount",
        error: true,
      });
      return;
    }
    if (selectedService) {
      let message = "";
      if (selectedSlot) {
         message = `Hi ${provider.username}, I would like to book you for ${selectedService.label
          } at ${selectedSlot.from} - ${selectedSlot.to
          } on ${date.toDateString()}\n. Kindly send me the quote.`;
        if (finalQuote) {
          message = `Can I book you for ${selectedService.label} at ${selectedSlot.from
            } - ${selectedSlot.to} on ${date.toDateString()} for $${finalQuote}?`;
        }
      } else {
         message = `Hi ${provider.username}, I would like to book you for ${selectedService.label
          } on ${date.toDateString()}\n. Kindly send me the quote.`;
        if (finalQuote) {
          message = `Can I book you for ${selectedService.label} on ${date.toDateString()} for $${finalQuote}?`;
        }
      }
      const bookingMessage = {
        sender: {
          id: currentProvider.id,
          username: currentProvider.username,
          photoURL: currentProvider?.photoURL ?? null,
        },
        user: currentProvider.id,
        receiver: {
          id: provider.id,
          username: provider.username,
          photoURL: provider?.photoURL ?? null,
        },
        message,
        timestamp: Date.now(),
        users: [currentProvider.id, provider.id],
        service: {
          id: selectedService.value,
          value: selectedService.label,
          price: selectedService.price,
          priceType: selectedService.priceType,
        },
        type: "quote",
        status: "pending",
        slot: selectedSlot,
        provider: {
          id: provider.id,
          name: provider.username,
        },
        client: {
          id: currentProvider.id,
          name: currentProvider.username,
        },
        quote: finalQuote,
        date: date,
        paid: false,
      };
      addMessage(bookingMessage);
      openDrawer("chatDrawer", provider);
      closeDrawer("providerDrawer");
    }
  };

  // Get available slots for the selected date
  const getSlotsForDate = (date) => {
    if (!selectedService || selectedService?.priceType === "fixed") return [];

    const dayName = date.toLocaleString("default", { weekday: "long" });
    const dateString = date.toISOString().split("T")[0];

    const weeklyAvailability = selectedService.availability.find(
      (week) => week.day === dayName
    );
    if (weeklyAvailability) return weeklyAvailability.slots;

    const specificDateAvailability = selectedService.availability.find(
      (spec) => spec.date === dateString
    );
    if (specificDateAvailability) return specificDateAvailability.slots;

    return [];
  };

  const slotsForDate = getSlotsForDate(date);

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

  // Get all available dates for the selected service
  const getAvailableDates = () => {
    if (!selectedService) return new Set();

    const availableDates = new Set();

    // Add weekly availability
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    selectedService.availability.forEach((avail) => {
      const dayIndex = daysOfWeek.indexOf(avail.day);
      if (dayIndex !== -1) {
        const today = new Date();
        const year = today.getFullYear();

        // Iterate over the next 12 months
        for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
          const monthDate = new Date(
            today.getFullYear(),
            today.getMonth() + monthOffset,
            1
          );
          const daysInMonth = new Date(
            monthDate.getFullYear(),
            monthDate.getMonth() + 1,
            0
          ).getDate();

          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(
              monthDate.getFullYear(),
              monthDate.getMonth(),
              day
            );
            if (date.getDay() === dayIndex) {
              availableDates.add(date.toISOString().split("T")[0]);
            }
          }
        }
      } else if (avail.date) {
        availableDates.add(avail.date);
      }
    });

    return availableDates;
  };

  const availableDates = getAvailableDates();

  const tileDisabled = ({ date }) => {
    const formattedDate = date.toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    return date < new Date(today) || !availableDates.has(formattedDate);
  };
  console.log(date);

  return (
    <div className="py-4">
      <Select
        options={provider.services}
        onChange={handleServiceChange}
        placeholder="Select a Service"
        styles={customStyles}
        className="mb-4"
      />
      <Calendar
        onChange={handleDateChange}
        value={date}
        className="mb-4 w-full"
        tileClassName="calendar-tile"
        tileDisabled={tileDisabled}
      />
      {provider?.priceType == "perHour" && (
        <div className="mb-4">
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: primaryColor }}
          >
            Available Slots
          </h3>
          {slotsForDate.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {slotsForDate.map((slot, index) => (
                <li
                  key={index}
                  onClick={() => handleSlotSelect(slot)}
                  className={`px-4 py-2 border rounded cursor-pointer ${
                    selectedSlot === slot
                      ? `bg-primary text-white`
                      : `bg-white text-black border-primary`
                  }`}
                >
                  {`${slot.from} - ${slot.to}`}
                  {selectedSlot === slot && (
                    <FaCheck className="inline ml-2 text-white" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              {date
                ? "No available slots for this date."
                : "Select service and a date above to view available slots."}
            </p>
          )}
        </div>
      )}
      {quote ? (
        <div className="mb-4">
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: primaryColor }}
          >
            Select an Offer (Optional):
          </h3>
          {selectedService?.priceType == "fixed" && (
            <ul className="flex flex-wrap gap-2 mb-2">
              <li
                onClick={() => {
                  showCustomPrice(false);
                  handleCounterOfferSelect(quote);
                }}
                className={`px-4 py-2 border rounded cursor-pointer ${
                  finalQuote === quote && customPrice == false
                    ? `bg-primary text-white`
                    : `bg-white text-black border-primary`
                }`}
              >
                <CurrencyFormatter amount={quote} />
              </li>
              <li
                onClick={() => showCustomPrice(true)}
                className={`px-4 py-2 border rounded cursor-pointer ${
                  customPrice == true
                    ? `bg-primary text-white`
                    : `bg-white text-black border-primary`
                }`}
              >
                Counter Offer
              </li>
              {customPrice == true && (
                <li className="content-center">
                  <div className="flex items-center  border rounded ml-2 ">
                    <span className="py-1 px-4 bg-gray-200">$</span>
                    <input
                      type="number"
                      className="px-2 py-1"
                      placeholder="Cost"
                      onChange={(e) => {
                        handleCounterOfferSelect(e.target.value);
                      }}
                    />
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
      ) : (
        ""
      )}
      {selectedSlot?.cost ? (
        <ul className="flex flex-wrap gap-2 mb-2">
          <li
            onClick={() => {
              showCustomPrice(false);
              handleCounterOfferSelect(selectedSlot?.cost);
            }}
            className={`px-4 py-2 border rounded cursor-pointer ${
              finalQuote === parseFloat(selectedSlot?.cost) &&
              customPrice == false
                ? `bg-primary text-white`
                : `bg-white text-black border-primary`
            }`}
          >
            ${selectedSlot?.cost}
          </li>
          <li
            onClick={() => showCustomPrice(true)}
            className={`px-4 py-2 border rounded cursor-pointer ${
              customPrice == true
                ? `bg-primary text-white`
                : `bg-white text-black border-primary`
            }`}
          >
            Counter Offer
          </li>
          {customPrice == true && (
            <li>
              <div className="flex items-center  border rounded ml-2">
                <span className="py-1 px-4 bg-gray-200">$</span>
                <input
                  type="number"
                  className="px-2 py-1"
                  placeholder="Cost"
                  onChange={(e) => {
                    handleCounterOfferSelect(e.target.value);
                  }}
                />
              </div>
            </li>
          )}
        </ul>
      ) : (
        ""
      )}
      <button
        onClick={handleBooking}
        disabled={
          !selectedService ||
          (!selectedSlot && selectedService?.priceType == "perHour") ||
          (selectedService?.priceType == "fixed" && !finalQuote || date == null)
        }
        className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
      >
        Book Now
      </button>
    </div>
  );
};

export default AvailabilityCalendar;
