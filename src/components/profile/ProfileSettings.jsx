import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProvider } from "../../redux/features/providerSlice";
import Select from "react-select";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import Switch from "../../sharable/Switch";
import { TimePicker } from "antd";
import moment from "moment";
import {
  fetchServices,
  updateProviderAvailability,
} from "../../services/firebaseService"; // Import the fetchServices function

const daysOptions = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
  { value: "All Days", label: "All Days" },
];

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.currentProvider);
  console.log(provider);

  const [formData, setFormData] = useState(provider);
  const [servicesOptions, setServicesOptions] = useState([]);
  const [currentAvailability, setCurrentAvailability] = useState(
    formData.services.map(() => ({ day: "", slots: [{ from: "", to: "" }] }))
  );

  useEffect(() => {
    const getServices = async () => {
      const servicesList = await fetchServices();
      setServicesOptions(servicesList);
    };
    getServices();

    if (provider.availability) {
      setFormData(provider);
    }
  }, [provider]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocationChange = (address) => {
    handleChange("location", address.label);
  };

  const handleSkillsChange = (selectedOptions) => {
    const updatedServices = selectedOptions.map((service) => {
      const existingService = formData.services.find(
        (s) => s.value === service.value
      );
      return existingService
        ? existingService
        : { ...service, availability: { weekly: [], specificDates: [] } };
    });
    handleChange("services", updatedServices);
  };

  const handleSaveAvailability = async (serviceIndex) => {
    const newServices = JSON.parse(JSON.stringify(formData.services)); // Deep clone the services array
    newServices[serviceIndex].availability.push({
      ...currentAvailability[serviceIndex],
    });

    const userId = provider.id; // Assuming provider object has the user's id
    console.log("newServices", provider.id, newServices);
    await updateProviderAvailability(userId, newServices);

    setFormData({ ...formData, services: newServices });
    setCurrentAvailability(
      currentAvailability.map((availability, index) =>
        index === serviceIndex
          ? { day: "", slots: [{ from: "", to: "" }] }
          : availability
      )
    );
  };

  const handleRemoveAvailability = (serviceIndex, availIndex) => {
    const newServices = [...formData.services];
    newServices[serviceIndex].availability = newServices[
      serviceIndex
    ].availability.filter((_, i) => i !== availIndex);
    setFormData({ ...formData, services: newServices });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(updateProvider(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Skills
        </label>
        <Select
          isMulti
          value={formData.services}
          onChange={handleSkillsChange}
          options={servicesOptions}
          className="mt-1"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <GooglePlacesAutocomplete
          selectProps={{
            value: { label: formData.location, value: formData.location },
            onChange: handleLocationChange,
          }}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <div className="flex items-center mt-1">
          <input
            type="number"
            value={formData.pricePerHour}
            onChange={(e) => handleChange("pricePerHour", e.target.value)}
            className="block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 mr-2"
            placeholder="Price per hour"
          />
          <select
            value={formData.priceType}
            onChange={(e) => handleChange("priceType", e.target.value)}
            className="block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="perHour">Per Hour</option>
            <option value="fixed">Fixed Price</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        {formData.services.map((service, serviceIndex) => (
          <div key={service.value} className="mb-4">
            <h3 className="text-lg font-bold">{service.label}</h3>

            {service.availability.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mt-2">
                  {service.availability.map((avail, availIndex) => (
                    <div
                      key={availIndex}
                      className="bg-primary text-white px-2 py-1 rounded-full flex items-center"
                    >
                      <span>
                        {avail.day}:{" "}
                        {avail.slots
                          .map((slot) => `${slot.from} - ${slot.to}`)
                          .join(", ")}
                      </span>
                      <button
                        type="button"
                        className="ml-2 text-white"
                        onClick={() =>
                          handleRemoveAvailability(serviceIndex, availIndex)
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4">
              <Select
                value={daysOptions.find(
                  (option) =>
                    option.value === currentAvailability[serviceIndex].day
                )}
                onChange={(option) => {
                  const newAvailability = [...currentAvailability];
                  newAvailability[serviceIndex].day = option.value;
                  setCurrentAvailability(newAvailability);
                }}
                options={daysOptions.filter(
                  (option) =>
                    !service.availability.some(
                      (avail) => avail.day === option.value
                    )
                )}
                className="mt-1"
              />
              {currentAvailability[serviceIndex].day && (
                <div className="mt-2">
                  {currentAvailability[serviceIndex].slots.map(
                    (slot, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <TimePicker
                          className="w-full"
                          use12Hours
                          format="h:mm a"
                          placeholder="From"
                          value={slot.from ? moment(slot.from, "h:mm a") : null}
                          onChange={(time, timeString) => {
                            const newSlots = [
                              ...currentAvailability[serviceIndex].slots,
                            ];
                            newSlots[index].from = timeString;
                            const newAvailability = [...currentAvailability];
                            newAvailability[serviceIndex].slots = newSlots;
                            setCurrentAvailability(newAvailability);
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
                            const newSlots = [
                              ...currentAvailability[serviceIndex].slots,
                            ];
                            newSlots[index].to = timeString;
                            const newAvailability = [...currentAvailability];
                            newAvailability[serviceIndex].slots = newSlots;
                            setCurrentAvailability(newAvailability);
                          }}
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                          onClick={() => {
                            const newSlots = [
                              ...currentAvailability[serviceIndex].slots,
                            ];
                            newSlots.splice(index, 1);
                            const newAvailability = [...currentAvailability];
                            newAvailability[serviceIndex].slots = newSlots;
                            setCurrentAvailability(newAvailability);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                  <button
                    type="button"
                    className="bg-primary text-white px-4 py-2 rounded mt-2"
                    onClick={() => handleSaveAvailability(serviceIndex)}
                    disabled={
                      !currentAvailability[serviceIndex].slots[0]?.from ||
                      !currentAvailability[serviceIndex].slots[0]?.to
                    }
                  >
                    Save Availability
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-500 text-white rounded-md"
      >
        Save Changes
      </button>
    </form>
  );
};

export default ProfileSettings;
