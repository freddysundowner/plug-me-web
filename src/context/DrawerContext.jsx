// DrawerContext.js
import React, { createContext, useState, useCallback } from "react";

const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [drawerState, setDrawerState] = useState({
    searchDrawer: { isOpen: false, selectedProvider: null },
    providerDrawer: { isOpen: false, selectedProvider: null },
    chatDrawer: { isOpen: false, selectedProvider: null },
    loginDrawer: { isOpen: false, selectedProvider: null, type: "login" },
    inboxDrawer: { isOpen: false, selectedProvider: null, messages: [] },
    becomeProvider: { isOpen: false, selectedProvider: null },
  });

  const openDrawer = useCallback(
    (drawer, provider = null, messages = [], type = "login") => {
      setDrawerState((prevState) => ({
        ...prevState,
        [drawer]: { isOpen: true, selectedProvider: provider, messages, type },
      }));
    },
    []
  );

  const closeDrawer = useCallback((drawer) => {
    setDrawerState((prevState) => ({
      ...prevState,
      [drawer]: { isOpen: false, selectedProvider: null },
    }));
  }, []);

  return (
    <DrawerContext.Provider value={{ drawerState, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

export default DrawerContext;
