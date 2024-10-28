import React from "react";
import Select from "react-select";

const SkillsSelect = ({ selectedSkills, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Skills</label>
    <Select
      isMulti
      value={selectedSkills}
      onChange={onChange}
      options={options}
      className="mt-1"
    />
  </div>
);

export default SkillsSelect;
