// Home.js
import React, { useState, useEffect, useContext } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import SearchBar from "./SearchBar";
import FeaturedProviders from "./FeaturedProviders";
import Menu from "./Menu";
import SearchResults from "../drawer/SearchResults";
import useDataLoader from "./DataLoader";
import DrawerContext, { DrawerProvider } from "../context/DrawerContext";
import ProviderDetails from "../drawer/ProviderDetails";
import ChatPage from "../drawer/ChatPage";
import ChatContext, { ChatProvider } from "../context/ChatContext";
import NotificationIcon from "../sharable/NotificationIcon";
import Chats from "../drawer/Inboxes";
import MessageFeed from "../components/MessageFeed";
import SnackMessage from "../sharable/SnackMessage";
import GlobalContext, { GlobalProvider } from "../context/GlobalContext";
import Switch from "../sharable/Switch";
const libraries = ["places"]; // Required library for Places API

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const useGeolocation = (defaultCenter, defaultZoom) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoomLevel, setZoomLevel] = useState(defaultZoom);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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

  return { mapCenter, zoomLevel };
};

const Home = () => {
  const { drawerState, openDrawer, closeDrawer } = useContext(DrawerContext);
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

  const { mapCenter, zoomLevel } = useGeolocation(
    { lat: -3.745, lng: -38.523 },
    10
  );

  const handleNewMessage = (msg) => {
    setFeedMessages((prevMessages) => [...prevMessages, msg]);
    addMessage(msg);
  };

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
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
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
        <MapOverlay
          providers={providers}
          skills={skills}
          onResultsClick={handleResultsClick}
          messages={messages}
          unreadCount={unreadCount}
        />

        <Markers providers={providers} />
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
        {showAlert.show && <SnackMessage message={showAlert.message} />}
      </GoogleMap>
      {visiblePopupMessages.length > 0 && !drawerState.chatDrawer.isOpen && (
        <MessageFeed />
      )}
    </LoadScript>
  );
};

const MapOverlay = ({
  providers,
  skills,
  onResultsClick,
  messages,
  unreadCount,
}) => {
  const [isAvailable, setIsAvailable] = useState(false);

  const handleAvailabilityChange = (event) => {
    setIsAvailable(event.target.checked);
  };
  return (
    <div className="">
      <div className="absolute top-4 left-4">
        <h2>PlugMe</h2>
      </div>
      {/* <SearchBar
      skills={skills}
      onResultsClick={onResultsClick}
      providers={providers}
    /> */}
      <SearchBar
        skills={skills}
        onResultsClick={onResultsClick}
        providers={providers}
      />
      <div className="absolute right-4 top-4 shadow-black shadow-2xl rounded-full ">
        <div className="flex gap-4">
          <Switch checked={isAvailable} onChange={handleAvailabilityChange} />
          <Menu provider={providers[0]} />
          <NotificationIcon
            messages={messages}
            unreadCount={unreadCount}
            provider={providers[0]}
          />
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <FeaturedProviders providers={providers} />
      </div>
    </div>
  );
};

const Markers = ({ providers }) => (
  <>
    {providers.map((provider) => (
      <Marker
        key={provider.id}
        position={{ lat: provider.latitude, lng: provider.longitude }}
        onClick={() => handleMarkerClick(provider)}
      />
    ))}
  </>
);

const HomeWithProvider = () => (
  <Provider store={store}>
    <GlobalProvider>
      <DrawerProvider>
        <ChatProvider>
          <Home />
        </ChatProvider>
      </DrawerProvider>
    </GlobalProvider>
  </Provider>
);

export default HomeWithProvider;
