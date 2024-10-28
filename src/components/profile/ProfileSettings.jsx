import React from "react";
import { useProfileForm } from "../../hooks/useProfileForm";
import SkillsSelect from "../../components/SkillsSelect";
import LocationInput from "../../components/LocationInput";
import Availability from "../../components/Availability";
import Loading from "../../sharable/Loading";
import { daysOptions } from "../../utils/constants";

const ProfileSettings = () => {
  const {
    formData,
    setFormData,
    servicesOptions,
    currentAvailability,
    loading,
    saving,
    handleChange,
    handleLocationChange,
    saveChanges,
    handleAddTimeslot,
    handleRemoveTimeslot,
    handleSaveAvailability,
    handleRemoveAvailability,
    setCurrentAvailability,
  } = useProfileForm();
  const handleDaySelect = (day, serviceIndex) => {
    const newAvailability = [...currentAvailability];
    newAvailability[serviceIndex] = {
      ...newAvailability[serviceIndex],
      day,
      slots: newAvailability[serviceIndex]?.slots || [{ from: "", to: "" }],
    };
    setCurrentAvailability(newAvailability);
  };
  const handleChangeTime = (timeType, timeString, serviceIndex, slotIndex) => {
    const newAvailability = [...currentAvailability];
    const slots = newAvailability[serviceIndex]?.slots || [];

    // Update the `from` or `to` value of the specific slot
    slots[slotIndex] = {
      ...slots[slotIndex],
      [timeType]: timeString,
    };

    newAvailability[serviceIndex] = {
      ...newAvailability[serviceIndex],
      slots,
    };

    setCurrentAvailability(newAvailability);
  };

  const handleSkillsChange = (selectedOptions) => {
    const updatedServices = selectedOptions.map((service) => {
      const existingService = formData.services?.find(
        (s) => s.value === service.value
      );
      return existingService
        ? existingService
        : { ...service, availability: { weekly: [], specificDates: [] } };
    });
    handleChange("services", updatedServices);
  };

  const handlePriceTypeChange = (index, priceType) => {
    const updatedServices = [...formData.services];
    updatedServices[index].priceType = priceType;
    setFormData({ ...formData, services: updatedServices });
  };
const handleCostChange = (cost, serviceIndex, slotIndex) => {
    const newAvailability = [...currentAvailability];
    const slots = newAvailability[serviceIndex]?.slots || [];

    // Update the `cost` value of the specific slot
    slots[slotIndex] = {
      ...slots[slotIndex],
      cost,
    };

    newAvailability[serviceIndex] = {
      ...newAvailability[serviceIndex],
      slots,
    };

    setCurrentAvailability(newAvailability);
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveChanges();
      }}
      className="mb-10"
    >
      <SkillsSelect
        selectedSkills={formData.services}
        onChange={handleSkillsChange}
        options={servicesOptions}
      />
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
      <LocationInput
        location={formData.location}
        onChange={handleLocationChange}
      />

      {formData?.services?.map((service, serviceIndex) => (
        <Availability
          key={service.value}
          service={service}
          daysOptions={daysOptions}
          availability={currentAvailability[serviceIndex]}
          onPriceTypeChange={(priceType) =>
            handlePriceTypeChange(serviceIndex, priceType)
          }
          onAddTimeslot={() => handleAddTimeslot(serviceIndex)}
          onRemoveTimeslot={(slotIndex) =>
            handleRemoveTimeslot(serviceIndex, slotIndex)
          }
          onSave={() => handleSaveAvailability(serviceIndex)}
          onRemoveAvailability={(availIndex) =>
            handleRemoveAvailability(serviceIndex, availIndex)
          }
          onDaySelect={(day) => handleDaySelect(day, serviceIndex)}
          onChangeTime={(timeType, timeString, slotIndex) =>
            handleChangeTime(timeType, timeString, serviceIndex, slotIndex)
          }
          onCostChange={(cost, slotIndex) =>
            handleCostChange(cost, serviceIndex, slotIndex)
          } // Pass onCostChange prop
        />
      ))}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-500 text-white rounded-md mt-4"
      >
        {saving ? <Loading color="white" /> : "Update Changes"}
      </button>
    </form>
  );
};

export default ProfileSettings;
