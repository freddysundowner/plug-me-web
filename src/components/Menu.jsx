import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";

function Menu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <button
        className="p-2 bg-white rounded shadow-md"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <FiMenu className="w-6 h-6" />
      </button>
      {isMenuOpen && (
        <div className="absolute bottom-12 bg-white shadow-lg p-4 rounded">
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Providers List</li>
            <li>Services Categories</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Menu;
