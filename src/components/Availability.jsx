import React from "react";
import { TimePicker } from "antd";
import Select from "react-select";
import moment from "moment";
import { CurrencyFormatter } from "../utils/dateFormat";

const Availability = ({
  service,
  daysOptions,
  availability,
  onAddTimeslot,
  onRemoveTimeslot,
  onSave,
  onRemoveAvailability,
  onPriceTypeChange,
  onDaySelect,
  onChangeTime,
  onCostChange,
}) => (
  <div className="mb-4 border p-4 rounded-md">
    <h3 className="text-lg font-bold capitalize">{service.label}</h3>
    <div className="flex flex-wrap gap-2 mt-2">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Price Type
      </label>
      <select
        className="shadow border rounded w-full py-2 px-3 text-gray-700 mb-2"
        value={service.priceType}
        onChange={(e) => onPriceTypeChange(e.target.value)}
        required
      >
        <option value="perHour">Per Hour</option>
        <option value="fixed">Fixed Price</option>
      </select>
    </div>

    {service.availability?.map((avail, index) => (
      <div key={index} className="flex items-center mb-2">
        <span>{avail.day}:</span>
        <span className="ml-2 text-sm">
          {service.priceType === "fixed" ? (
            <CurrencyFormatter amount={service.price} />
          ) : (
            avail.slots
              .map((slot) => `${slot.from} - ${slot.to} ($${slot.cost ?? 0})`)
              .join(", ")
          )}
        </span>
        <button
          type="button"
          onClick={() => onRemoveAvailability(index)}
          className="ml-2 text-red-500"
        >
          ×
        </button>
      </div>
    ))}

    <h2 className="mt-4">Set Availability</h2>
    <div className="flex flex-row gap-2">
      <div className="w-[80%]">
        <Select
          options={daysOptions.filter(
            (option) =>
              !service.availability.some((avail) => avail.day === option.value)
          )}
          onChange={(option) => onDaySelect(option.value)}
        />
      </div>
      <button
        type="button"
        className="bg-primary text-white px-2 py-2 rounded"
        onClick={onAddTimeslot}
      >
        Timeslot +
      </button>
    </div>

    {availability.slots?.map((slot, index) => (
      <div key={index} className="flex items-center mt-2">
        <TimePicker
          use12Hours
          format="h:mm a"
          placeholder="From"
          value={slot.from ? moment(slot.from, "h:mm a") : null}
          onChange={(time, timeString) =>
            onChangeTime("from", timeString, index)
          }
          className="w-full"
        />
        <span className="mx-2">to</span>
        <TimePicker
          use12Hours
          format="h:mm a"
          placeholder="To"
          value={slot.to ? moment(slot.to, "h:mm a") : null}
          onChange={(time, timeString) => onChangeTime("to", timeString, index)}
          className="w-full"
        />
        <div className="flex items-center border rounded ml-2">
          <span className="py-1 px-4 bg-gray-200">$</span>
          <input
            type="number"
            className="px-2 py-1"
            placeholder="Cost"
            value={slot.cost || ""}
            onChange={(e) => onCostChange(e.target.value, index)}
          />
        </div>
        <button
          type="button"
          onClick={() => onRemoveTimeslot(index)}
          className="bg-red-500 text-white px-2 py-1 rounded ml-2"
        >
          Remove
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={onSave}
      className="bg-primary text-white px-4 py-2 rounded mt-4"
    >
      Save Availability
    </button>
  </div>
);

export default Availability;
