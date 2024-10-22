import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProvider } from "../../redux/features/providerSlice";
import Select from "react-select";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { TimePicker } from "antd";
import { GeoPoint } from "firebase/firestore";
import moment from "moment";
import {
  fetchServices,
  updateProviderAvailability,
  updateProviderData,
} from "../../services/firebaseService"; // Import the fetchServices function
import Loading from "../../sharable/loading";
import { getPlaceDetails } from "../../services/httpClient";

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
  
  const [formData, setFormData] = useState(provider);
  const [servicesOptions, setServicesOptions] = useState([]);
  const [currentAvailability, setCurrentAvailability] = useState(
    formData.services?.map(() => ({ day: "", slots: [{ from: "", to: "" }] }))
  );  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
  const handleLocationChange = async (place) => {
    if (place && place.value && place.value.place_id) {
      const location = await getPlaceDetails(place.value.place_id);
      handleChange("location", place?.label);
      handleChange("geopoint", new GeoPoint(location.lat, location.lng));
    } else {
      handleChange("location", { lat: null, lng: null });
    }
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

  const handleSaveChanges = async () => {
    setSaving(true);
    const userId = provider.id; 
    await updateProviderData(userId, formData);
    setSaving(false);
  };

  const handleSaveAvailability = async (serviceIndex) => {
    setLoading(true);
    const newServices = JSON.parse(JSON.stringify(formData.services)); 
    newServices[serviceIndex].availability.push({
      ...currentAvailability[serviceIndex],
    });

    const userId = provider.id; 
    await updateProviderAvailability(userId, newServices);
    setLoading(false);

    setFormData({ ...formData, services: newServices });
    setCurrentAvailability(
      currentAvailability.map((availability, index) =>
        index === serviceIndex
          ? { day: "", slots: [{ from: "", to: "" }] }
          : availability
      )
    );
  };

  const handleAddTimeslot = (serviceIndex) => {
    const newAvailability = [...currentAvailability];
    newAvailability[serviceIndex].slots.push({ from: "", to: "" });
    setCurrentAvailability(newAvailability);
  };

  const handleRemoveTimeslot = (serviceIndex, slotIndex) => {
    const newAvailability = [...currentAvailability];
    newAvailability[serviceIndex].slots.splice(slotIndex, 1);
    setCurrentAvailability(newAvailability);
  };

  const handleRemoveAvailability = (serviceIndex, availIndex) => {
    const newServices = formData.services.map((service, index) => {
      if (index === serviceIndex) {
        return {
          ...service,  // Clone the service object
          availability: service.availability.filter((_, i) => i !== availIndex), // Filter out the availability
        };
      }
      return service;  // Return other services unchanged
    });
    setFormData((prevState) => ({
      ...prevState,
      services: newServices,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(updateProvider(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
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
            value: {
              label: formData.location,
              value: formData.location,
            },
            onChange: handleLocationChange,
          }}
        />
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
                          .map((slot) => `${slot.from} - ${slot.to} $${slot.cost}`)
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
              <h2>Set Availability</h2>
              <div className="flex flex-row gap-2">
                <div className="w-[80%]">
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
                  />
                </div>
                <div className="">
                  <button
                    type="button"
                    className="bg-primary text-white px-2 py-2 rounded"
                    onClick={() => handleAddTimeslot(serviceIndex)}
                  >
                    Timeslot +
                  </button>
                </div>
              </div>
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
                        <div className="flex items-center  border rounded ml-2">
                          <span className="py-1 px-4 bg-gray-200">$</span>
                          <input
                            type="number"
                            className="px-2 py-1"
                            placeholder="Cost"
                            value={slot.cost || ""}
                            onChange={(e) => {
                              const newSlots = [...currentAvailability[serviceIndex].slots];
                              newSlots[index].cost = e.target.value;
                              const newAvailability = [...currentAvailability];
                              newAvailability[serviceIndex].slots = newSlots;
                              setCurrentAvailability(newAvailability);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                          onClick={() =>
                            handleRemoveTimeslot(serviceIndex, index)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                  {loading ? (
                    <div className="flex">
                      <button
                        type="button"
                        className="bg-primary text-white px-4 py-2 rounded"
                      >
                        <Loading color="primary" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="bg-primary text-white px-4 py-2 rounded mt-2"
                      onClick={() => handleSaveAvailability(serviceIndex)}
                    >
                      Save Availability
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {saving ? (
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
          type="submit"
          onClick={handleSaveChanges}
          className="w-full py-2 px-4 bg-green-500 text-white rounded-md"
        >
          Save Changes
        </button>
      )}
    </form>
  );
};

export default ProfileSettings;
