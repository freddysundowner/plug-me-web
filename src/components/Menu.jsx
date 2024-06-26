import React, { useContext, useEffect, useState } from "react";
import { FiMenu, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import MyAccountDrawer from "../drawer/MyAccount";
import ProfileDrawer from "../drawer/Profile";
import { useAuth } from "../context/AuthContext";
import { signOutUser } from "../auth/auth";
import { FaUserCircle } from "react-icons/fa";
import NotificationIcon from "../sharable/NotificationIcon";
import DrawerContext from "../context/DrawerContext";
import { useSelector } from "react-redux";
import TaskBoard from "../drawer/TaskBoard";
import { getMessagesFromFirestore } from "../services/firebaseService";
import ChatContext from "../context/ChatContext";

function Menu({ provider }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [taskBoardOpen, setIsTaskBoardOpen] = useState(false);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { currentUser } = useAuth();
  const { openDrawer, closeDrawer } = useContext(DrawerContext);
  const { setMessages } = useContext(ChatContext);
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );

  useEffect(() => {
    const unsubscribe = getMessagesFromFirestore(
      currentUser,
      setMessages
    );
    return () => unsubscribe();
  }, [currentUser]);

  const handleBecomeProvider = async () => {
    openDrawer("becomeProvider", provider);
    setIsMenuOpen(false);
  };
  return (
    <div className="relative">
      <div className="flex items-center">
        <NotificationIcon />
        <button
          className="p-2 mt-1 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FaUserCircle className="text-gray-400 text-5xl" />
        </button>
      </div>
      {isMenuOpen && (
        <div className="absolute top-18 right-0 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-50">
          <ul className="py-2">
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
              onClick={() => {
                setIsMyAccountOpen(true);
                setIsTaskBoardOpen(false);
                setIsMenuOpen(false);
              }}
            >
              <FiUser className="mr-2" /> My Account
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
              onClick={() => {
                setIsTaskBoardOpen(true);
                setIsMenuOpen(false);
              }}
            >
              <FiUser className="mr-2" /> Tasks
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
            {currentProvider && !currentProvider.isProvider && (
              <li
                className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
                onClick={handleBecomeProvider}
              >
                <FiSettings className="mr-2" /> Become provider
              </li>
            )}
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center"
              onClick={() => {
                setIsLogoutOpen(true);
                setIsMenuOpen(false);
                signOutUser();
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
      <TaskBoard
        isOpen={taskBoardOpen}
        onClose={() => setIsTaskBoardOpen(false)}
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
