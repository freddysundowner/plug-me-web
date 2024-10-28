// DrawerContext.js
import React, { createContext, useState, useCallback } from "react";

const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [drawerState, setDrawerState] = useState({
    searchDrawer: { isOpen: false, selectedProvider: null },
    providerDrawer: { isOpen: false, selectedProvider: null },
    chatDrawer: { isOpen: false, selectedProvider: null, thread: null },
    loginDrawer: { isOpen: false, selectedProvider: null, type: "login" },
    inboxDrawer: { isOpen: false, selectedProvider: null, messages: [] },
    becomeProvider: { isOpen: false, selectedProvider: null },
    profile: { isOpen: false, selectedProvider: null },
  });

  // const openDrawer = useCallback(
  //   (drawer, provider = null, messages = [], type = "login", thread) => {
  //     setDrawerState((prevState) => ({
  //       ...prevState,
  //       [drawer]: {
  //         isOpen: true,
  //         selectedProvider: provider,
  //         messages,
  //         type,
  //         thread,
  //       },
  //     }));
  //   },
  //   []
  // );

  // const closeDrawer = useCallback((drawer) => {
  //   setDrawerState((prevState) => ({
  //     ...prevState,
  //     [drawer]: {
  //       isOpen: false,
  //       selectedProvider: null,
  //       messages: [],
  //       type: "login",
  //       thread: null,
  //     },
  //   }));
  // }, []);
  const closeAllDrawers = () => {
    setDrawerState((prevState) => {
      const updatedState = {};
      for (const drawer in prevState) {
        updatedState[drawer] = { ...prevState[drawer], isOpen: false };
      }
      return updatedState;
    });
  };
  const updateDrawerState = (drawer, updates) => {
    setDrawerState((prevState) => ({
      ...prevState,
      [drawer]: { ...prevState[drawer], ...updates },
    }));
  };

  const openDrawer = useCallback(
    (drawer, provider = null, messages = [], type = "login", thread) => {
      console.log(drawer);
      
      closeAllDrawers();
      updateDrawerState(drawer, {
        isOpen: true,
        selectedProvider: provider,
        messages,
        type,
        thread,
      });
    },
    []
  );

  const closeDrawer = useCallback((drawer) => {
    updateDrawerState(drawer, {
      isOpen: false,
      selectedProvider: null,
      messages: [],
      type: "login",
      thread: null,
    });
  }, []);
  return (
    <DrawerContext.Provider value={{ drawerState, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

export default DrawerContext;
