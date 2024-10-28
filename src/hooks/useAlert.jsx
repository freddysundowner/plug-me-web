import { useState } from "react";

const useAlert = (
  initialState = { show: false, message: "", error: false }
) => {
  const [alert, setAlert] = useState(initialState);

  const setShowAlert = (message, isError = false) => {
    setAlert({
      show: true,
      message,
      error: isError,
    });
  };

  const hideAlert = () => {
    setAlert({
      show: false,
      message: "",
      error: false,
    });
  };

  return { alert, setShowAlert, hideAlert, setAlert };
};

export default useAlert;
