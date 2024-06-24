import React, { useState, useEffect, useContext } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Provider, useSelector, useDispatch } from "react-redux";
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
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginSignupDrawer from "../drawer/LoginSignupDrawer";
const libraries = ["places"];
import { setProvider, clearProvider } from "../redux/features/providerSlice";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../auth/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ProviderFormDrawer from "../drawer/ProviderFormDrawer";
import NavBar from "./navbar";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const useGeolocation = (defaultCenter, defaultZoom) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoomLevel, setZoomLevel] = useState(defaultZoom);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          dispatch(setProvider({ ...userDoc.data(), id: user.uid })); // Save user data in Redux
        }
      } else {
        dispatch(clearProvider()); // Clear user data from Redux
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

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
  const { messages, addMessage, unreadCount, visiblePopupMessages, showAlert } =
    useContext(ChatContext);

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

  if (providersLoading || skillsLoading) {
    return <div>Loading...</div>;
  }

  if (providersError || skillsError) {
    return <div>Error loading data.</div>;
  }

  const handleResultsClick = (filteredProviders) => {
    openDrawer("searchDrawer", filteredProviders);
  };
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className="flex flex-row">
        <NavBar />
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
          {/* <MapOverlay
              providers={providers}
              skills={skills}
              messages={messages}
              unreadCount={unreadCount}
            /> */}

          {/* <Markers providers={providers} /> */}
          <SearchBar
            skills={skills}
            onResultsClick={handleResultsClick}
            providers={providers}
          />
        </GoogleMap>
        <div className="w-[45%] mt-24 scrollable-featured-providers">
          <FeaturedProviders providers={providers} />
        </div>
      </div>
      {drawerState.searchDrawer.isOpen && (
        <SearchResults
          providers={drawerState.searchDrawer.selectedProvider}
          isOpen={drawerState.searchDrawer.isOpen}
          onClose={() => closeDrawer("searchDrawer")}
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
      {drawerState.loginDrawer.isOpen && (
        <LoginSignupDrawer
          provider={drawerState.loginDrawer.selectedProvider}
          isOpen={drawerState.loginDrawer.isOpen}
          type={drawerState.loginDrawer.type}
          onClose={() => closeDrawer("loginDrawer")}
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
      {visiblePopupMessages.length > 0 && !drawerState.chatDrawer.isOpen && (
        <MessageFeed />
      )}
      {drawerState.providerDrawer.isOpen && (
        <ProviderDetails
          provider={drawerState.providerDrawer.selectedProvider}
          onClose={() => closeDrawer("providerDrawer")}
          isOpen={drawerState.providerDrawer.isOpen}
        />
      )}
      {drawerState.becomeProvider.isOpen && (
        <ProviderFormDrawer
          provider={drawerState.becomeProvider.selectedProvider}
          isOpen={drawerState.becomeProvider.isOpen}
          onClose={() => closeDrawer("becomeProvider")}
        />
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
  const { currentUser } = useAuth();
  const { drawerState, openDrawer, closeDrawer } = useContext(DrawerContext);
  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser && currentProvider) {
      setIsAvailable(currentProvider.online);
    }
  }, [currentUser, currentProvider]);

  const handleAvailabilityChange = (checked) => {
    setIsAvailable(checked);
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      updateDoc(userDocRef, { online: checked });
      dispatch(setProvider({ ...currentProvider, online: checked }));
    }
  };

  const handleBecomeProvider = async () => {
    openDrawer("becomeProvider", currentProvider);
  };

  return (
    <div className="">
      <div className="absolute right-4 top-4 shadow-black shadow-2xl rounded-full ">
        <div className="flex gap-4">
          {currentUser ? (
            <>
              {currentProvider?.isProvider ? (
                <Switch
                  checked={isAvailable}
                  onChange={handleAvailabilityChange}
                />
              ) : (
                <button
                  onClick={handleBecomeProvider}
                  className="bg-primary text-white px-4 py-2 rounded"
                >
                  Become a Provider
                </button>
              )}
              <Menu provider={providers[0]} />
              <NotificationIcon
                messages={messages}
                unreadCount={unreadCount}
                provider={providers[0]}
              />
            </>
          ) : (
            <>
              <nav className="bg-primary p-4 rounded-2xl">
                <ul className="flex space-x-4 text-white">
                  <li>
                    <a
                      onClick={() => openDrawer("loginDrawer")}
                      className="hover:text-gray-300 cursor-pointer"
                    >
                      Login
                    </a>
                  </li>
                  <li className="border-l border-gray-400 pl-4">
                    <a
                      onClick={() => openDrawer("loginDrawer")}
                      className="hover:text-gray-300 cursor-pointer"
                    >
                      Signup
                    </a>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
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
  <AuthProvider>
    <Provider store={store}>
      <GlobalProvider>
        <DrawerProvider>
          <ChatProvider>
            <Home />
          </ChatProvider>
        </DrawerProvider>
      </GlobalProvider>
    </Provider>
  </AuthProvider>
);

export default HomeWithProvider;
