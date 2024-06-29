import React from "react";
import Drawer from "./Drawer"; // Import the reusable Drawer component
import ProviderCard from "../cards/Provider"; // Import the ProviderCard component

const SearchResults = ({
  providers,
  isOpen,
  onClose,
  setProviderDrawerOpen,
  setSelectedProvider,
}) => {
  return (
    <Drawer
      title="Search Results"
      isOpen={isOpen}
      onClose={onClose}
      width="w-full md:w-1/2 lg:w-1/2 xl:w-1/2 2xl:w-1/2 3xl:w-1/2 " // Adjust width for responsiveness
    >
      <div className="grid grid-cols-2  sm:grid-cols-1 gap-4 p-4 lg:grid-cols-2 md:grid-cols-1 2xl:grid-cols-2">
        {" "}
        {providers && providers.length > 0 ? (
          providers.map((provider) => (
            <div key={provider.id} className="mb-4">
              <ProviderCard
                provider={provider}
                setSelectedProvider={setSelectedProvider}
                setProviderDrawerOpen={setProviderDrawerOpen}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-600">No providers found.</p>
        )}
      </div>
    </Drawer>
  );
};

export default SearchResults;
