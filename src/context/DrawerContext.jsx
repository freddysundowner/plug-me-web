// DrawerContext.js
import React, { createContext, useState, useCallback } from "react";

const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [drawerState, setDrawerState] = useState({
    searchDrawer: { isOpen: false, selectedProvider: null },
    providerDrawer: { isOpen: false, selectedProvider: null },
    chatDrawer: { isOpen: false, selectedProvider: null },
    inboxDrawer: { isOpen: false, selectedProvider: null, messages: [] },
  });


  const openDrawer = useCallback((drawer, provider = null, messages = []) => {
    setDrawerState((prevState) => ({
      ...prevState,
      [drawer]: { isOpen: true, selectedProvider: provider, messages },
    }));
  }, []);

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
