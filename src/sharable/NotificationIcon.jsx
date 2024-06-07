import React, { useContext, useState } from "react";
import { FaBell } from "react-icons/fa";
import DrawerContext from "../context/DrawerContext";
import Menu from "../components/Menu";

const NotificationIcon = ({ messages, unreadCount, provider }) => {
  const { openDrawer } = useContext(DrawerContext);
  const getUnreadCount = () => {
    return messages.filter((msg) => !msg.read).length;
  };
  const handleRatingsClick = () => {
    openDrawer("inboxDrawer", provider, messages);
  };

  return (
    <div
      className="relative bg-white border border-gray-300 rounded-full p-4 cursor-pointer"
      onClick={handleRatingsClick}
    >
      <FaBell color={getUnreadCount() > 0 ? "red" : "black"} />
      {getUnreadCount() > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
          {getUnreadCount()}
        </span>
      )}
    </div>
    
  );
};

export default NotificationIcon;
