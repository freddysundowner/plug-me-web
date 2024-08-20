import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
function CustomDatePicker({
  selectedDate,
  setSelectedDate,
  text = "Select date",
}) {
  return (
    <div className="border border-gray-300 rounded-md p-2 my-2 w-full">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="yyyy/MM/dd"
        placeholderText="Select a date"
        className="w-full"
        date={selectedDate}
        
      />
    </div>
  );
}

export default CustomDatePicker;
