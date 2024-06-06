import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCheck } from "react-icons/fa";
import Select from "react-select";

const AvailabilityCalendar = ({ provider, onBook, primaryColor }) => {
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedSlot(null); // Reset selected slot when date changes
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleServiceChange = (selectedOption) => {
    setSelectedService(selectedOption);
  };

  const handleBooking = () => {
    if (selectedSlot && selectedService) {
      onBook(date, selectedSlot, selectedService);
    }
  };

  // Get available slots for the selected date
  const getSlotsForDate = (date) => {
    const dayName = date.toLocaleString("default", { weekday: "long" });
    const dateString = date.toISOString().split("T")[0];
    const dateOfMonth = date.getDate();

    // Check weekly availability
    const weeklyAvailability = provider.availability.weekly.find(
      (week) => week.day === dayName
    );
    if (weeklyAvailability) return weeklyAvailability.slots;

    // Check monthly availability
    const monthlyAvailability = provider.availability?.monthly?.find(
      (month) => month.date == dateOfMonth
    );
    if (monthlyAvailability) return monthlyAvailability.slots;

    // Check specific date availability
    const specificDateAvailability = provider.availability.specificDates.find(
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

  // Get all available dates
  const getAvailableDates = () => {
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
    provider.availability.weekly.forEach((week) => {
      const dayIndex = daysOfWeek.indexOf(week.day);
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
    });

    // Add specific date availability
    provider.availability.specificDates.forEach((spec) => {
      availableDates.add(spec.date);
    });

    return availableDates;
  };

  const availableDates = getAvailableDates();

  const tileDisabled = ({ date }) => {
    return !availableDates.has(date.toISOString().split("T")[0]);
  };

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
                {slot}
                {selectedSlot === slot && (
                  <FaCheck className="inline ml-2 text-white" />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No available slots for this date.</p>
        )}
      </div>
      <button
        onClick={handleBooking}
        disabled={!selectedSlot || !selectedService}
        className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        // style={{ backgroundColor: primaryColor }}
      >
        Book Now
      </button>
    </div>
  );
};

export default AvailabilityCalendar;
