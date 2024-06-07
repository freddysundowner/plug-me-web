import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProvider } from "../redux/features/providerSlice";
import Drawer from "./Drawer";
import Select from "react-select";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import Switch from "../sharable/Switch";

const skillsOptions = [
  { value: "Wiring installation", label: "Wiring installation" },
  { value: "Circuit repairs", label: "Circuit repairs" },
  { value: "Lighting installation", label: "Lighting installation" },
  { value: "Outlet installation", label: "Outlet installation" },
];

const Profile = ({ isOpen = false, onClose = () => {} }) => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.currentProvider);

  const [currentSection, setCurrentSection] = useState("Contact Info");
  const [formData, setFormData] = useState(provider);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(updateProvider(formData));
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocationChange = (address) => {
    handleChange("location", address.label);
  };

  const handleSkillsChange = (selectedOptions) => {
    handleChange("services", selectedOptions);
  };

  const renderSection = () => {
    switch (currentSection) {
      case "Contact Info":
        return (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                WhatsApp
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => handleChange("facebook", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                LinkedIn
              </label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-500 text-white rounded-md"
            >
              Save Changes
            </button>
          </form>
        );
      case "Profile Settings":
        return (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
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
                options={skillsOptions}
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
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Availability
              </label>
              <div className="flex items-center mt-1">
                <Switch
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    handleChange("isAvailable", e.target.checked)
                  }
                />
                <span className="ml-2">
                  {formData.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-500 text-white rounded-md"
            >
              Save Changes
            </button>
          </form>
        );
      // Add more cases for other sections here
      default:
        return null;
    }
  };

  return (
    <Drawer
      title="Profile"
      isOpen={isOpen}
      onClose={onClose}
      subText="Edit your profile information"
    >
      <div className="flex">
        <nav className="w-1/4">
          <ul className="list-none p-0">
            <li
              className={`p-2 cursor-pointer ${
                currentSection === "Contact Info" ? "bg-green-100" : ""
              }`}
              onClick={() => setCurrentSection("Contact Info")}
            >
              Contact Info
            </li>
            <li
              className={`p-2 cursor-pointer ${
                currentSection === "Profile Settings" ? "bg-green-100" : ""
              }`}
              onClick={() => setCurrentSection("Profile Settings")}
            >
              Profile Settings
            </li>
            {/* Add more sections here */}
          </ul>
        </nav>
        <div className="w-3/4 p-4">{renderSection()}</div>
      </div>
    </Drawer>
  );
};

export default Profile;
