import { useState } from "react";

const useFormData = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return { formData, setFormData, handleChange };
};

export default useFormData;
