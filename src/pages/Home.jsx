import React, { useState, useEffect, useContext } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "../redux/store";
import ProvidersList from "../components/Providers";
import SearchResults from "../drawer/SearchResults";
import DrawerContext, { DrawerProvider } from "../context/DrawerContext";
import ProviderDetails from "../drawer/ProviderDetails";
import ChatPage from "../drawer/ChatPage";
import ChatContext, { ChatProvider } from "../context/ChatContext";
import NotificationIcon from "../sharable/NotificationIcon";
import Chats from "../drawer/Inboxes";
import MessagesComponent from "../components/MessageFeed";
import SnackMessage from "../sharable/SnackMessage";
import { GlobalProvider } from "../context/GlobalContext";
import { AuthProvider } from "../context/AuthContext";
import LoginSignupDrawer from "../drawer/Auth";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  setProvider,
  clearProvider,
  setProviders,
} from "../redux/features/providerSlice";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../init/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ProviderFormDrawer from "../drawer/OnboardProvider";
import NavBar from "../components/NavBar";
import { calculateDistance, getProviders } from "../services/firebaseService";
import { LoadingProvider } from "../context/LoadingContext";
import useOnlineStatus from "../hooks/useOnlineStatus";
import Map from "../components/Map";
import useGeolocation from "../hooks/useGeolocation";
import useAlert from "../hooks/useAlert";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const libraries = ["places", "drawing", "geometry", "marker"];

const Home = () => {
  const dispatch = useDispatch();
  const { drawerState, openDrawer, closeDrawer } = useContext(DrawerContext);
  const [drawingMode, setDrawingMode] = useState(null);
  const { messages, addMessage, visiblePopupMessages, showAlert } =
    useContext(ChatContext); //showAlert to be removed

  const { alert } = useAlert();

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
        <div className="flex flex-row w-full">
          <div className="w-1/2">
            <Map
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
          </div>
          <div className="mt-24 scrollable-featured-providers w-1/2 lg:w-1/3">
            <ProvidersList />
          </div>
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
      {alert.show && <SnackMessage message={alert.message} />}
      {showAlert.show && <SnackMessage message={showAlert.message} />}
      {visiblePopupMessages.length > 0 && !drawerState.chatDrawer.isOpen && (
        <MessagesComponent />
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
