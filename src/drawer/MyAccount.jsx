import React from "react";
import Drawer from "./Drawer";

const MyAccount = ({ isOpen, onClose }) => {
  return (
    <Drawer
      title="My Account"
      isOpen={isOpen}
      onClose={onClose}
      subText="Manage your account settings"
    >
      <div>
        <h3 className="text-lg font-semibold mb-2">Account Details</h3>
        <p>Email: user@example.com</p>
        <p>Username: user123</p>
        {/* Add more account details here */}
      </div>
    </Drawer>
  );
};

export default MyAccount;
