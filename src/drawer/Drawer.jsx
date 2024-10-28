import React, { useEffect } from "react";
import { FaTimes, FaUserCircle } from "react-icons/fa";
import LoaderPage from "../pages/LoaderPage";

const Drawer = ({
  title,
  children,
  isOpen,
  onClose,
  width = "2xl:w-2/3 xl:w-1/2 lg:w-2/3 md:w-2/3 sm:w-full",
  subText = "",
  actionButton,
  showheader = true,
  showIcon = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 flex justify-end top-20">
      <div
        className={`${width} bg-white shadow-xl transition-transform transform translate-x-0 ease-in-out duration-300 h-full max-h-[calc(100vh-5rem)]`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          {showheader ? (
            <div className="flex items-center gap-6">
              {showIcon && <FaUserCircle className="text-gray-400 text-5xl" />}
              <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                {subText && <p className="text-sm font-thin py-1">{subText}</p>}
              </div>
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex">
            {actionButton}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(100vh-8rem)] mb-10">
          <LoaderPage />
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
