import React, { useState } from "react";
import { FiMenu, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import MyAccountDrawer from "../drawer/MyAccount";
import ProfileDrawer from "../drawer/Profile";

function Menu({ provider }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="p-2 mt-1 bg-white rounded shadow-md focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <FiMenu className="w-6 h-6" />
      </button>
      {isMenuOpen && (
        <div className="absolute top-12 right-0 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-10">
          <ul className="py-2">
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
              onClick={() => {
                setIsMyAccountOpen(true);
                setIsMenuOpen(false);
              }}
            >
              <FiUser className="mr-2" /> My Account
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
              onClick={() => {
                setIsProfileOpen(true);
                setIsMenuOpen(false);
              }}
            >
              <FiSettings className="mr-2" /> Profile
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
              onClick={() => {
                setIsLogoutOpen(true);
                setIsMenuOpen(false);
              }}
            >
              <FiLogOut className="mr-2" /> Logout
            </li>
          </ul>
        </div>
      )}
      <MyAccountDrawer
        isOpen={isMyAccountOpen}
        onClose={() => setIsMyAccountOpen(false)}
      />
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        provider={provider}
      />
    </div>
  );
}

export default Menu;
