import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchServices,
  updateProviderAvailability,
  updateProviderData,
} from "../services/firebaseService";
import { GeoPoint } from "firebase/firestore";
import { getPlaceDetails } from "../services/httpClient";

export const useProfileForm = () => {
  const provider = useSelector((state) => state.provider.currentProvider);

  const [formData, setFormData] = useState({});
  const [servicesOptions, setServicesOptions] = useState([]);
  const [currentAvailability, setCurrentAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch services and set initial form data based on provider data
  useEffect(() => {
    const loadData = async () => {
      const services = await fetchServices();
      setServicesOptions(services);

      if (provider) {
        setFormData(provider);
        setCurrentAvailability(
          provider.services?.map((service) => service.availability) || []
        );
      }
    };

    loadData();
  }, [provider]);

  // General handleChange function for updating form fields
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle location updates using Google Places Autocomplete
  const handleLocationChange = async (place) => {
    if (place?.value?.place_id) {
      const location = await getPlaceDetails(place.value.place_id);
      handleChange("location", place.label);
      handleChange("geopoint", new GeoPoint(location.lat, location.lng));
    } else {
      handleChange("location", "");
      handleChange("geopoint", null);
    }
  };

  // Handle adding a new timeslot to a specific service's availability
  const handleAddTimeslot = (serviceIndex) => {
    const newAvailability = [...currentAvailability];
    newAvailability[serviceIndex].slots.push({ from: "", to: "" });
    setCurrentAvailability(newAvailability);
  };

  // Handle removing a timeslot from a specific service's availability
  const handleRemoveTimeslot = (serviceIndex, slotIndex) => {
    const newAvailability = [...currentAvailability];
    newAvailability[serviceIndex].slots.splice(slotIndex, 1);
    setCurrentAvailability(newAvailability);
  };

  // Handle saving availability for a specific service
  const handleSaveAvailability = async (serviceIndex) => {
    setLoading(true);
    const newServices = JSON.parse(JSON.stringify(formData.services));
    newServices[serviceIndex].availability.push({
      ...currentAvailability[serviceIndex],
    });

    await updateProviderAvailability(provider.id, newServices);
    setLoading(false);

    setFormData((prev) => ({ ...prev, services: newServices }));
    resetAvailability(serviceIndex);
  };

  // Reset availability to initial state after saving
  const resetAvailability = (serviceIndex) => {
    setCurrentAvailability((prev) =>
      prev.map((availability, index) =>
        index === serviceIndex
          ? { day: "", slots: [{ from: "", to: "" }] }
          : availability
      )
    );
  };

  // Handle removing an entire availability entry from a service
  const handleRemoveAvailability = (serviceIndex, availIndex) => {
    const newServices = formData.services.map((service, index) => {
      if (index === serviceIndex) {
        return {
          ...service,
          availability: service.availability.filter((_, i) => i !== availIndex),
        };
      }
      return service;
    });
    setFormData((prev) => ({ ...prev, services: newServices }));
  };

  // Save changes made to formData (excluding availability updates)
  const saveChanges = async () => {
    setSaving(true);
    await updateProviderData(provider.id, formData);
    setSaving(false);
  };

  return {
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
  };
};
