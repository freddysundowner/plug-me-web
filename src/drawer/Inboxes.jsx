import React, { useContext, useEffect, useState } from "react";
import ChatContext from "../context/ChatContext"; // Import ChatContext
import { FaEnvelope } from "react-icons/fa";
import Drawer from "./Drawer";
import { timeAgo } from "../utils/timeAgo";
import DrawerContext from "../context/DrawerContext";
import { useAuth } from "../context/AuthContext";
import { getMessagesFromFirestore } from "../services/firebaseService";

const Inboxes = ({ isOpen, onClose, provider }) => {

  const { messages, markAsRead, setMessages } = useContext(ChatContext);
  const { openDrawer, closeDrawer } = useContext(DrawerContext);
  const [selectedChat, setSelectedChat] = useState(null);


  const getLastMessage = (sender) => {
    return messages
      .filter((msg) => msg.sender === sender)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  };

  const getUnreadCount = (sender) => {
    return messages.filter((msg) => msg.sender === sender && !msg.read).length;
  };

  const senders = [...new Set(messages.map((msg) => msg.sender))];

  return (
    <Drawer title="Inbox" isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        {senders.map((sender) => {
          const lastMessage = getLastMessage(sender);
          const unreadCount = getUnreadCount(sender);
          console.log(lastMessage);

          return (
            <div
              key={lastMessage?.timestamp}
              className="flex items-center p-2 border-b"
              onClick={() => {
                setSelectedChat(sender);
                markAsRead(sender);
                console.log(provider);
                closeDrawer("inboxDrawer");
                openDrawer("chatDrawer", provider);
              }}
            >
              <div className="flex-1">
                <p className="font-bold">{lastMessage?.sender?.name}</p>
                <p>{lastMessage.message}</p>
                <span className="text-xs text-gray-600">
                  {timeAgo(lastMessage.timestamp)}
                </span>
              </div>
              {unreadCount > 0 && (
                <div className="ml-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Drawer>
  );
};

export default Inboxes;
