import React, { useState } from "react";
import Drawer from "./Drawer";
import TaskBoard from "./TaskBoard";
import Transactions from "../components/myaccount/Transactions";
import { FiUser, FiList } from "react-icons/fi";
const MyAccount = ({ isOpen = false, onClose = () => {} }) => {
  const [currentSection, setCurrentSection] = useState("account");

  const renderSection = () => {
    switch (currentSection) {
      case "Tasks":
        return <TaskBoard />;
      // Add more cases for other sections here if needed
      case "account":
        return <Transactions />;
      default:
        return null;
    }
  };

  return (
    <Drawer
      title="My Account"
      isOpen={isOpen}
      onClose={onClose}
      subText="Manage your tasks"
      width="w-2/3"
    >
      <div className="flex">
        <div className="w-full p-4">{renderSection()}</div>
      </div>
    </Drawer>
  );
};

export default MyAccount;
