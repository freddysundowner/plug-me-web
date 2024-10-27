import { useEffect, useState } from "react";

const useGeolocation = (defaultCenter, defaultZoom) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoomLevel, setZoomLevel] = useState(defaultZoom);

  useEffect(() => {
    let userLat, userLon;
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        let { latitude, longitude } = position.coords;

        setMapCenter({
          lat: latitude,
          lng: longitude,
        });
      });
    } catch (error) {
      userLat = null;
      userLon = null;
    }
    setZoomLevel(15);
  }, []);

  return { mapCenter, zoomLevel };
};
export default useGeolocation;
