import React, { useState, useEffect, useContext } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "../redux/store";
import FeaturedProviders from "./FeaturedProviders";
import Menu from "./Menu";
import SearchResults from "../drawer/SearchResults";
import DrawerContext, { DrawerProvider } from "../context/DrawerContext";
import ProviderDetails from "../drawer/ProviderDetails";
import ChatPage from "../drawer/ChatPage";
import ChatContext, { ChatProvider } from "../context/ChatContext";
import NotificationIcon from "../sharable/NotificationIcon";
import Chats from "../drawer/Inboxes";
import MessageFeed from "../components/MessageFeed";
import SnackMessage from "../sharable/SnackMessage";
import { GlobalProvider } from "../context/GlobalContext";
import Switch from "../sharable/Switch";
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginSignupDrawer from "../drawer/LoginSignupDrawer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  setProvider,
  clearProvider,
  setProviders,
} from "../redux/features/providerSlice";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../auth/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ProviderFormDrawer from "../drawer/ProviderFormDrawer";
import NavBar from "./navbar";
import { calculateDistance, getProviders } from "../services/firebaseService";
import { LoadingProvider } from "../context/LoadingContext";
import useOnlineStatus from "../hooks/useOnlineStatus";
import MapComponent from "./Map";
import useGeolocation from "../hooks/useGeolocation";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const libraries = ["places", "drawing", "geometry", "marker"];

const Home = () => {
  const dispatch = useDispatch();
  const { drawerState, openDrawer, closeDrawer } = useContext(DrawerContext);
  const [drawingMode, setDrawingMode] = useState(null);
  const { messages, addMessage, visiblePopupMessages, showAlert } =
    useContext(ChatContext);

  const currentProvider = useSelector(
    (state) => state.provider.currentProvider
  );
  const providers = useSelector((state) => state.provider.providers);
  const [feedMessages, setFeedMessages] = useState([]);
  const { mapCenter, zoomLevel } = useGeolocation({}, 10);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          dispatch(
            setProvider({
              ...userDoc.data(),
              id: user.uid,
              geopoint: {
                latitude: userDoc.data()?.geopoint?.latitude,
                longitude: userDoc.data()?.geopoint?.longitude,
              },
            })
          ); // Save user data in Redux
        }
      } else {
        dispatch(clearProvider()); // Clear user data from Redux
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    if (drawingMode == null) {
      getProviders(currentProvider).then((data) => {
        const providers = data.map((provider) => ({
          ...provider,
          geopoint: {
            latitude: provider?.geopoint?.latitude,
            longitude: provider?.geopoint?.longitude,
          },
        }));
        if (!mapCenter?.lat && !mapCenter?.lng) {
          dispatch(setProviders(providers));
        } else {
          let allProviders = providers.map((provider) => {
            const providerData = provider;
            const providerLocation = providerData.geopoint;

            const hasValidLocation =
              providerLocation &&
              providerLocation.latitude != null &&
              providerLocation.longitude != null;

            const distance =
              mapCenter?.lat && mapCenter?.lng && hasValidLocation
                ? calculateDistance(
                    mapCenter.lat,
                    mapCenter.lng,
                    providerLocation.latitude,
                    providerLocation.longitude
                  )
                : -1;
            return {
              ...providerData,
              distance: parseFloat(distance.toFixed(2)),
            };
          });
          dispatch(setProviders(allProviders));
        }
      });
    } 
  }, [mapCenter, currentProvider, drawingMode]);

  const handleNewMessage = (msg) => {
    setFeedMessages((prevMessages) => [...prevMessages, msg]);
    addMessage(msg);
  };
  useOnlineStatus(currentProvider?.id);
  return (
    <>
      <div className="flex flex-row">
        <NavBar />
        <MapComponent
          providers={providers}
          mapCenter={mapCenter}
          drawingMode={drawingMode}
          setDrawingMode={setDrawingMode}
          zoom={10}
          handleMarkerClick={(provider) =>
            openDrawer("providerDrawer", provider)
          }
          libraries={libraries}
        />
        <div className="w-[45%] mt-24 scrollable-featured-providers">
          <FeaturedProviders />
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
        <Elements stripe={stripePromise}>
          <ChatPage
            provider={drawerState.chatDrawer.selectedProvider}
            thread={drawerState.chatDrawer.thread}
            isOpen={drawerState.chatDrawer.isOpen}
            onClose={() => closeDrawer("chatDrawer")}
            messages={messages}
            addMessage={handleNewMessage}
          />
        </Elements>
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
    </>
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

// const Markers = ({ providers }) => {
//   console.log(providers);

//   return (
//     <>
//       {providers.map((provider) => (
//         <Marker
//           key={provider.id}
//           position={{
//             lat: provider?.geopoint?.latitude,
//             lng: provider?.geopoint.longitude,
//           }}
//           onClick={() => handleMarkerClick(provider)}
//         />
//       ))}
//     </>
//   );
// }

const HomeWithProvider = () => (
  <AuthProvider>
    <LoadingProvider>
      <Provider store={store}>
        <GlobalProvider>
          <DrawerProvider>
            <ChatProvider>
              <Home />
            </ChatProvider>
          </DrawerProvider>
        </GlobalProvider>
      </Provider>
    </LoadingProvider>
  </AuthProvider>
);

export default HomeWithProvider;
