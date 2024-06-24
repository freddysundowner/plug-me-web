import React, { useContext, useState } from "react";
import { FaBell } from "react-icons/fa";
import DrawerContext from "../context/DrawerContext";
import Menu from "../components/Menu";
import ChatContext from "../context/ChatContext";
import { useSelector } from "react-redux";

const NotificationIcon = ({}) => {
  const { messages, addMessage, unreadCount, visiblePopupMessages, showAlert } =
    useContext(ChatContext);
  const { openDrawer } = useContext(DrawerContext);
  const getUnreadCount = () => {
    return messages.filter((msg) => !msg.read).length;
  };
  const provider = useSelector((state) => state.provider.currentProvider);
  const handleRatingsClick = () => {
    openDrawer("inboxDrawer", provider, messages);
  };

  return (
    <div
      className="relative bg-white border border-gray-300 rounded-full p-4 cursor-pointer h-[50px] mr-4"
      onClick={handleRatingsClick}
    >
      <FaBell color={getUnreadCount() > 0 ? "red" : "black"} />
      {getUnreadCount() > 0 && (
        <span className="absolute top-5 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
          {getUnreadCount()}
        </span>
      )}
    </div>
  );
};

export default NotificationIcon;
