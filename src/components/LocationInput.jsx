import React from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const LocationInput = ({ location, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Location</label>
    <GooglePlacesAutocomplete
      selectProps={{
        value: { label: location, value: location },
        onChange,
      }}
    />
  </div>
);

export default LocationInput;
