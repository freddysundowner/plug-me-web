import React, { useState, useContext, useEffect } from "react";
import { FaTimes, FaFilter } from "react-icons/fa";
import DrawerContext from "../context/DrawerContext";
import Slider from "rc-slider";
import { AiOutlineSearch } from "react-icons/ai";
import { FiNavigation, FiSliders, FiEdit3 } from "react-icons/fi";

import "rc-slider/assets/index.css";
import Switch from "../sharable/Switch";
import { useAuth } from "../context/AuthContext";
import { useSelector } from "react-redux";
import { updateProviderData } from "../services/firebaseService";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const SearchBar = ({
  skills,
  providers,
  centerToCurrentLocation,
  handlePlaceSelect,
  setDrawingMode,
  drawingMode,
}) => {
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [distanceRange, setDistanceRange] = useState(100);
  const [service, setService] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [query, setQuery] = useState({});

  const { currentUser } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );

  const { openDrawer } = useContext(DrawerContext);

  const handleAdvancedSearch = () => {
    const filteredProviders = providers.filter((provider) => {
      const matchesService = query?.value
        ? provider.services?.some((service) => service.value === query.value)
        : true;
      const matchesServiceAndAvailability =
        query?.value && selectedDay
          ? provider.services.some(
              (service) =>
                service.value === query.value &&
                service.availability.some((day) => day.day === selectedDay)
            )
          : true;
      console.log(distanceRange, query, selectedDay);

      const matchesDistance = distanceRange
        ? provider.distance <= distanceRange
        : true;
      return matchesService && matchesServiceAndAvailability && matchesDistance;
    });

    openDrawer("searchDrawer", filteredProviders);
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery((prevQuery) => ({
      ...prevQuery,
      label: value,
    }));
    if (value) {
      const matchedSkills = skills.filter((skill) =>
        skill?.label?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSkills(matchedSkills);
    } else {
      setFilteredSkills([]);
    }
  };

  const getSkillProviderCount = (skill) => {
    let results = providers.filter((provider) => {
      const matchesQuery =
        provider.services &&
        provider.services.some((service) =>
          service?.label?.toLowerCase().includes(skill?.label?.toLowerCase())
        );
      return matchesQuery;
    });
    return results.length;
  };

  const handleClear = () => {
    setQuery("");
    setFilteredSkills([]);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  useEffect(() => {
    if (currentUser && currentProvider) {
      setIsAvailable(currentProvider.available);
    }
  }, [currentUser, currentProvider]);
  const handleAvailabilityChange = async (checked) => {
    setIsAvailable(checked?.target?.checked);
    if (currentProvider) {
      await updateProviderData(currentProvider.id, {
        available: checked?.target?.checked,
      });
    }
  };
  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10  w-full flex flex-col items-center space-x-2">
      <div className="w-[70%] flex items-center  rounded p-2 space-x-2">
        <div className="flex items-center bg-white p-2 rounded-full shadow-lg w-full">
          <button className="p-2">
            <AiOutlineSearch className="text-xl" />
          </button>
          <div className="w-full">
            <GooglePlacesAutocomplete
              selectProps={{
                onChange: handlePlaceSelect,
                placeholder: "Search by address",
                styles: {
                  input: (provided) => ({
                    ...provided,
                    width: "100%",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#f1f1f1" : "white",
                    color: "#333",
                    padding: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }),
                  control: (provided, state) => ({
                    ...provided,
                    width: "100%",
                    borderColor: "#e0e0e0",
                    border: "0px",
                    boxShadow: "none",
                    borderColor: state.isFocused ? "#e0e0e0" : "#e0e0e0",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    borderRadius: "8px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                    marginTop: "8px",
                    overflow: "hidden",
                    marginLeft: "-40px",
                    width: "calc(100% + 40px)",
                  }),
                },
              }}
              autocompletionRequest={
                {
                  // componentRestrictions: {
                  //   country: "fr",
                  // },
                }
              }
            />
          </div>
        </div>
        <button
          className="p-3 bg-white rounded-full shadow-lg"
          onClick={centerToCurrentLocation}
        >
          <FiNavigation className="text-2xl" />
        </button>
        <button
          className={`p-3 ${
            isFilterOpen ? "bg-red-500 text-white" : "bg-white text-black"
          } rounded-full shadow-lg`}
          onClick={toggleFilter}
        >
          <FiSliders className="text-2xl" />
        </button>
        <button
          className={`p-3 ${
            drawingMode ? "bg-red-500 text-white" : "bg-white text-black"
          } rounded-full shadow-lg`}
          onClick={() => {
            if (drawingMode == "polygon") {
              setDrawingMode(null);
            } else {
              setDrawingMode("polygon");
            }
          }}
        >
          <FiEdit3 className="text-2xl" />
        </button>
        {currentProvider && currentProvider?.isProvider  && (
          <Switch checked={isAvailable} onChange={handleAvailabilityChange} />
        )}
      </div>
      {isFilterOpen && (
        <div className="absolute top-full mt-2 w-full max-w-xl bg-white border rounded shadow-lg z-10 p-4">
          {/* <div className="mb-4">
            <label className="block text-gray-700">
              Earnings: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <Slider range value={priceRange} onChange={setPriceRange} />
          </div> */}
          <div className="mb-4">
            <label className="block text-gray-700">
              Distance Range: {distanceRange} miles
            </label>
            <Slider
              value={distanceRange}
              onChange={(value) => setDistanceRange(value)}
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700">Service</label>
            <input
              type="text"
              value={query?.label}
              onChange={(e) => handleInputChange(e)}
              placeholder="e.g., plumbing"
              className="w-full p-2 border rounded"
            />

            {filteredSkills.length > 0 && (
              <ul className="absolute top-full mt-2 w-1/2  bg-white border rounded-md shadow-lg z-10">
                {filteredSkills.map((skill, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      setQuery(skill);
                      setFilteredSkills([]);
                    }}
                  >
                    {skill?.label} ({getSkillProviderCount(skill)})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Availability Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Any Day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAdvancedSearch}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
