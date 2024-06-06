import { useContext, useState } from "react";
import ChatContext from "../context/ChatContext";
import Select from "react-select";
import { FaTimes, FaUserCircle } from "react-icons/fa";

const Modal = ({
  title,
  children,
  isOpen,
  onClose,
  cancelText = "Cancel",
  submitTxt = "Submit",
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-md shadow-md w-1/2 mx-10">
        <div className="flex justify-between items-center ">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        {children}

        <div className="flex  justify-end mt-10">
          <div className="flex gap-4">
            <button
              onClick={() => onClose()}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              {cancelText}
            </button>
            <button
              onClick={() => onClose()}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              {submitTxt}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Modal;
