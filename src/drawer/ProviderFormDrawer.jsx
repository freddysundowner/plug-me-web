import React, { useState, useEffect } from "react";
import Drawer from "./Drawer"; // Import the reusable Drawer component
import { useDispatch } from "react-redux";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db, auth } from "../auth/firebaseConfig";
import { setProvider } from "../redux/features/providerSlice";
import Select from "react-select";
import { Autocomplete } from "@react-google-maps/api";
import { TimePicker } from "antd"; // Import TimePicker from Ant Design or any other library
import moment from "moment"; // Import moment for handling time

const ProviderFormDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [servicesOptions, setServicesOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    skill: "",
    whatsapp: "",
    facebook: "",
    linkedin: "",
    email: "",
    pricePerHour: "",
    description: "",
    services: [],
    availability: { weekly: [], specificDates: [] },
    location: "",
  });
  const [currentAvailability, setCurrentAvailability] = useState({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const querySnapshot = await getDocs(collection(db, "services"));
    const servicesList = querySnapshot.docs.map((doc) => ({
      value: doc.id,
      label: doc.data().label,
    }));
    setServicesOptions(servicesList);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleServicesChange = (selectedOptions) => {
    const updatedServices = selectedOptions.map((service) => {
      const existingService = formData.services.find(
        (s) => s.value === service.value
      );
      return existingService
        ? existingService
        : { ...service, priceType: "perHour", price: "", availability: [] };
    });
    setFormData({
      ...formData,
      services: updatedServices,
    });
  };

  const handleSaveAvailability = (serviceIndex) => {
    const newServices = [...formData.services];
    newServices[serviceIndex].availability.push({
      ...currentAvailability[serviceIndex],
    });
    setFormData({ ...formData, services: newServices });
    setCurrentAvailability({
      ...currentAvailability,
      [serviceIndex]: { day: "", slots: [{ from: "", to: "" }] },
    });
  };

  const handleRemoveTimeSlot = (serviceIndex, slotIndex) => {
    const newSlots = [...currentAvailability[serviceIndex].slots];
    newSlots.splice(slotIndex, 1);
    setCurrentAvailability({
      ...currentAvailability,
      [serviceIndex]: {
        ...currentAvailability[serviceIndex],
        slots: newSlots,
      },
    });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      const providerData = {
        ...formData,
        isProvider: true,
        online: true,
      };

      // Expand "All Days" into individual days
      providerData.availability.weekly =
        providerData.availability.weekly.reduce((acc, day) => {
          if (day.day === "All Days") {
            const allDays = [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ];
            allDays.forEach((d) => {
              acc.push({ day: d, slots: day.slots });
            });
          } else {
            acc.push(day);
          }
          return acc;
        }, []);

      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, providerData);
        dispatch(setProvider(providerData));
        onClose();
      } catch (error) {
        console.error("Error updating provider status:", error);
      }
    }
  };

  const renderBasicInformation = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Basic Information</h2>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="location"
        >
          Location
        </label>
        <Autocomplete
          onPlaceSelected={(place) =>
            setFormData({
              ...formData,
              location: place.formatted_address,
            })
          }
          types={["address"]}
          componentRestrictions={{ country: "us" }}
        >
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </Autocomplete>
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Profile Description
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );

  const renderAvailabilityForm = (service, index) => {
    const availableDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const selectedDays = service.availability.map((avail) => avail.day);

    return (
      <div key={service.value} className="mb-4 border rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{service.label}</h3>
          <button
            type="button"
            className="bg-red-500 text-white px-2 py-1 rounded"
            onClick={() => {
              const newServices = formData.services.filter(
                (_, i) => i !== index
              );
              setFormData({ ...formData, services: newServices });
            }}
          >
            Remove
          </button>
        </div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor={`priceType-${service.value}`}
        >
          {service.label} Price Type
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
          id={`priceType-${service.value}`}
          name={`priceType-${service.value}`}
          value={service.priceType}
          onChange={(e) => {
            const newServices = [...formData.services];
            newServices[index].priceType = e.target.value;
            setFormData({ ...formData, services: newServices });
          }}
          required
        >
          <option value="perHour">Per Hour</option>
          <option value="fixed">Fixed Price</option>
        </select>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor={`price-${service.value}`}
        >
          {service.label}{" "}
          {service.priceType === "perHour" ? "Price Per Hour" : "Fixed Price"}
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id={`price-${service.value}`}
          name={`price-${service.value}`}
          type="text"
          value={service.price}
          onChange={(e) => {
            const newServices = [...formData.services];
            newServices[index].price = e.target.value;
            setFormData({ ...formData, services: newServices });
          }}
          required
        />

        {service.availability.length > 0 && (
          <div className="m-4">
            <div className="flex flex-wrap gap-2">
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
                    onClick={() => {
                      const newServices = [...formData.services];
                      newServices[index].availability.splice(availIndex, 1);
                      setFormData({
                        ...formData,
                        services: newServices,
                      });
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!service.availability.some((avail) => avail.day === "All Days") && (
          <>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Day of the Week
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              value={currentAvailability[index]?.day || ""}
              onChange={(e) => {
                const selectedDay = e.target.value;
                setCurrentAvailability({
                  ...currentAvailability,
                  [index]: {
                    day: selectedDay,
                    slots: [{ from: "", to: "" }],
                  },
                });
              }}
            >
              <option value="">Select Day</option>
              <option value="All Days">All Days</option>
              {availableDays
                .filter((day) => !selectedDays.includes(day))
                .map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
            </select>
            {currentAvailability[index]?.day && (
              <>
                {currentAvailability[index].slots.map((slot, slotIndex) => (
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
                        setCurrentAvailability({
                          ...currentAvailability,
                          [index]: {
                            ...currentAvailability[index],
                            slots: newSlots,
                          },
                        });
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
                        setCurrentAvailability({
                          ...currentAvailability,
                          [index]: {
                            ...currentAvailability[index],
                            slots: newSlots,
                          },
                        });
                      }}
                    />
                    <button
                      type="button"
                      className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                      onClick={() => handleRemoveTimeSlot(index, slotIndex)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-primary text-white px-4 py-2 rounded mt-2"
                  onClick={() => handleSaveAvailability(index)}
                  disabled={
                    !currentAvailability[index]?.slots[0]?.from ||
                    !currentAvailability[index]?.slots[0]?.to
                  }
                >
                  Save Availability
                </button>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  const renderServicesAndAvailability = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Services / Availability</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Select Service(s) you offer (You can select more than one service)
        </label>
        <Select
          isMulti
          options={servicesOptions}
          value={formData.services}
          onChange={handleServicesChange}
        />
      </div>
      {formData.services.map((service, index) =>
        renderAvailabilityForm(service, index)
      )}
    </div>
  );

  const renderContactInformation = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Reachout</h2>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="whatsapp"
        >
          Whatsapp Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="whatsapp"
          name="whatsapp"
          type="text"
          value={formData.whatsapp}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="facebook"
        >
          Facebook
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="facebook"
          name="facebook"
          type="text"
          value={formData.facebook}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="linkedin"
        >
          LinkedIn
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="linkedin"
          name="linkedin"
          type="text"
          value={formData.linkedin}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderBasicInformation();
      case 2:
        return renderServicesAndAvailability();
      case 3:
        return renderContactInformation();
      default:
        return null;
    }
  };

  return (
    <Drawer
      title="Become a Provider"
      isOpen={isOpen}
      onClose={onClose}
      width="md:w-2/3"
    >
      <form onSubmit={handleSubmit} className="p-4 mb-20">
        {renderStep()}
        <div className="flex items-center justify-between mt-4">
          {step > 1 && (
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              className="bg-primary text-white px-4 py-2 rounded"
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button
              className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </Drawer>
  );
};

export default ProviderFormDrawer;
