// Home.js
import React, { useState, useEffect, useContext } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import SearchBar from "./SearchBar";
import FeaturedProviders from "./FeaturedProviders";
import Menu from "./Menu";
import SearchResults from "../drawer/SearchResults"; // Import the SearchResults component
import useDataLoader from "./DataLoader";
import DrawerContext, { DrawerProvider } from "../context/DrawerContext";
import ProviderDetails from "../drawer/ProviderDetails";
import ChatPage from "../drawer/ChatPage";
import ChatContext, { ChatProvider } from "../context/ChatContext";
import NotificationIcon from "../sharable/NotificationIcon";
import Chats from "../drawer/Inboxes";
import MessageFeed from "../components/MessageFeed"; // Import the MessageFeed component
import SnackMessage from "../sharable/SnackMessage";
import Modal from "../sharable/Modal";
import GlobalContext, { GlobalProvider } from "../context/GlobalContext";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const Home = () => {
  const { drawerState, openDrawer, closeDrawer } = useContext(DrawerContext);
  const { showModal } = useContext(GlobalContext);

  const {
    messages,
    addMessage,
    unreadCount,
    visiblePopupMessages,
    showAlert,
    setShowAlert,
  } = useContext(ChatContext);
  const [feedMessages, setFeedMessages] = useState([]);

  const {
    data: providers,
    loading: providersLoading,
    error: providersError,
  } = useDataLoader("/providers.json");
  const {
    data: skills,
    loading: skillsLoading,
    error: skillsError,
  } = useDataLoader("/skills.json");
  const [mapCenter, setMapCenter] = useState({ lat: -3.745, lng: -38.523 });
  const [zoomLevel, setZoomLevel] = useState(10);
  const handleNewMessage = (msg) => {
    setFeedMessages((prevMessages) => [...prevMessages, msg]);
    addMessage(msg);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: 34.0522, //position.coords.latitude,
            lng: -118.2437, //position.coords.longitude,
          });
          setZoomLevel(15);
        },
        (error) => {
          console.error("Error getting location: " + error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleResultsClick = (filteredProviders) => {
    openDrawer("searchDrawer", filteredProviders);
  };

  if (providersLoading || skillsLoading) {
    return <div>Loading...</div>;
  }

  if (providersError || skillsError) {
    return <div>Error loading data.</div>;
  }
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoomLevel}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        <div className="absolute top-4 left-4">
          <h2>PlugMe</h2>
        </div>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full">
          <SearchBar
            onResultsClick={handleResultsClick}
            skills={skills}
            providers={providers}
          />
        </div>
        <NotificationIcon
          messages={messages}
          unreadCount={unreadCount}
          provider={providers[0]}
        />
        <div className="absolute bottom-4 left-4">
          <Menu />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <FeaturedProviders providers={providers} />
        </div>
        {drawerState.searchDrawer.isOpen && (
          <SearchResults
            providers={drawerState.searchDrawer.selectedProvider}
            isOpen={drawerState.searchDrawer.isOpen}
            onClose={() => closeDrawer("searchDrawer")}
          />
        )}
        {drawerState.providerDrawer.isOpen && (
          <ProviderDetails
            provider={drawerState.providerDrawer.selectedProvider}
            onClose={() => closeDrawer("providerDrawer")}
            isOpen={drawerState.providerDrawer.isOpen}
          />
        )}
        {drawerState.chatDrawer.isOpen && (
          <ChatPage
            provider={drawerState.chatDrawer.selectedProvider}
            isOpen={drawerState.chatDrawer.isOpen}
            onClose={() => closeDrawer("chatDrawer")}
            messages={messages}
            addMessage={handleNewMessage}
          />
        )}
        {drawerState.inboxDrawer.isOpen && (
          <Chats
            isOpen={drawerState.inboxDrawer.isOpen}
            onClose={() => closeDrawer("inboxDrawer")}
            provider={drawerState.inboxDrawer.selectedProvider}
          />
        )}
        {providers.map((provider) => (
          <Marker
            key={provider.id}
            position={{ lat: provider.latitude, lng: provider.longitude }} // Adjust this to your provider location
            onClick={() => handleMarkerClick(provider)}
          />
        ))}

        {showAlert.show == true && <SnackMessage message={showAlert.message} />}
        {/* {selectedProvider && (
          <InfoWindow
            position={{
              lat: selectedProvider.latitude,
              lng: selectedProvider.longitude,
            }} // Adjust this to your provider location
            onCloseClick={() => setSelectedProvider(null)}
          >
            <div>
              <h2>{selectedProvider.name}</h2>
              <p>{selectedProvider.description}</p>
              <p>Rating: {selectedProvider.rating}</p>
            </div>
          </InfoWindow>
        )} */}
        {/* {drawerState.providerDrawer.isOpen && (
          <ActiveTasksPage
            provider={provider}
            isOpen={isActiveTasksOpen}
            onClose={() => setIsActiveTasksOpen(false)}
            activeTasks={activeTasks}
          />
        )} */}
      </GoogleMap>
      {visiblePopupMessages.length > 0 && !drawerState.chatDrawer.isOpen && (
        <MessageFeed />
      )}
    </LoadScript>
  );
};
const HomeWithProvider = () => (
  <GlobalProvider>
    <DrawerProvider>
      <ChatProvider>
        <Home />
      </ChatProvider>
    </DrawerProvider>
  </GlobalProvider>
);

export default HomeWithProvider;
