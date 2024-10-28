import React, { useContext, useEffect, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  DrawingManager,
} from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import SearchBar from "./Search";
import { db } from "../init/firebaseConfig";
import { getDocs, collection } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { useRef } from "react";
import DrawerContext from "../context/DrawerContext";

const Map = ({
  providers,
  mapCenter,
  zoom,
  handleMarkerClick,
  libraries,
  drawingMode,
  setDrawingMode,
}) => {
  const [servicesOptions, setServicesOptions] = useState([]);
  const [renderKey, setRenderKey] = useState(0);
  const [drawnShape, setDrawnShape] = useState(null);
  const dispatch = useDispatch();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  useEffect(() => {
    fetchServices();
  }, []);

  const { openDrawer } = useContext(DrawerContext);

  const fetchServices = async () => {
    const querySnapshot = await getDocs(collection(db, "services"));
    const servicesList = querySnapshot.docs.map((doc) => ({
      value: doc.id,
      label: doc.data().name,
    }));
    setServicesOptions(servicesList);
  };
  const drawingManagerRef = useRef(null); // Ref for DrawingManager instance

  const [map, setMap] = useState(null);
  const onOverlayComplete = (event) => {
    if (drawnShape) {
      drawnShape.setMap(null);
    }
    const newShape = event.overlay;
    setDrawnShape(newShape);
    if (event.type === "polygon" || event.type === "circle") {
      const providersWithinShape = providers.filter((provider) => {
        const providerLocation = new google.maps.LatLng(
          provider.geopoint.latitude,
          provider.geopoint.longitude
        );

        if (event.type === "polygon") {
          return google.maps.geometry.poly.containsLocation(
            providerLocation,
            newShape
          );
        } else if (event.type === "circle") {
          const circleCenter = newShape.getCenter();
          const circleRadius = newShape.getRadius();
          return (
            google.maps.geometry.spherical.computeDistanceBetween(
              providerLocation,
              circleCenter
            ) <= circleRadius
          );
        }
        return false;
      });

      openDrawer("searchDrawer", providersWithinShape);
      // dispatch(setProviders(providersWithinShape));
    }
  };
  const centerToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          if (map) {
            // Ensure map is loaded and accessible
            map.panTo({ lat: latitude, lng: longitude });
            map.setZoom(15);
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handlePlaceSelect = async (place) => {
    if (place?.value?.place_id) {
      const placesService = new window.google.maps.places.PlacesService(map);
      placesService.getDetails(
        { placeId: place.value.place_id },
        (placeDetails, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const location = placeDetails.geometry.location;

            map.panTo({ lat: location.lat(), lng: location.lng() });
            map.setZoom(15);
          }
        }
      );
    }
  };
  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);
  useEffect(() => {
    if (!map || !window.google || !providers.length) return;
    const markers = providers.map((provider) => {
      const content = document.createElement("div");
      content.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: white; 
            border-radius: 50%; 
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); 
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px; 
            height: 40px;
            ">
            <img src="src/assets/user.jpg" alt="profile" style="width: 100%; height: 100%; border-radius: 50%;" />
          </div>
          <div style="
            background: rgba(255, 255, 255, 0.8); 
            padding: 4px 8px; 
            border-radius: 4px;
            margin-top: 4px;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
            font-size: 10px;
            font-weight: bold;
            color: #333;
            text-align: center;
          ">
            ${provider.username}<br/>
            ${provider.distance} km away
          </div>
        </div>
      `;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: {
          lat: provider.geopoint.latitude,
          lng: provider.geopoint.longitude,
        },
        content,
        title: provider.username,
      });

      marker.addListener("click", () => handleMarkerClick(provider));

      return marker;
    });

    const markerClusterer = new MarkerClusterer({ markers, map });

    return () => {
      markerClusterer.clearMarkers();
    };
  }, [map, providers, handleMarkerClick]);
  useEffect(() => {
    return () => {
      // Cleanup previous shape if the component is unmounted
      if (drawnShape) {
        drawnShape.setMap(null);
      }
    };
  }, [drawnShape, drawingMode]);
  if (!isLoaded) return <p>Loading...</p>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100vh" }}
      center={mapCenter}
      zoom={zoom}
      onLoad={handleMapLoad}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: "6b50a3059651a0e9",
      }}
    >
      {drawingMode != null ? (
        <DrawingManager
          ref={drawingManagerRef}
          key={renderKey}
          drawingMode={drawingMode}
          onOverlayComplete={onOverlayComplete}
          options={{
            drawingControl: false,
            polygonOptions: {
              fillColor: "#2196F3",
              fillOpacity: 0.2,
              strokeWeight: 2,
              clickable: false,
              editable: false,
              zIndex: 1,
            },
            circleOptions: {
              fillColor: "#2196F3",
              fillOpacity: 0.2,
              strokeWeight: 2,
              clickable: false,
              editable: false,
              zIndex: 1,
            },
          }}
        />
      ) : (
        <></>
      )}
      <SearchBar
        skills={servicesOptions}
        providers={providers}
        centerToCurrentLocation={centerToCurrentLocation}
        handlePlaceSelect={handlePlaceSelect}
        setDrawingMode={setDrawingMode}
        drawingMode={drawingMode}
      />
    </GoogleMap>
  );
};

export default Map;
