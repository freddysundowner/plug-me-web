import React,{useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProvider } from "../../redux/features/providerSlice";

const ContactInfo = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.currentProvider);

  const [formData, setFormData] = useState(provider);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(updateProvider(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData?.email}
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
          value={formData?.whatsapp}
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
          value={formData?.facebook}
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
          value={formData?.linkedin}
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
};

export default ContactInfo;
