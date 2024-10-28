// src/LoginSignupDrawer.js
import React, { useContext, useState } from "react";
import Drawer from "./Drawer";
import ChatContext from "../context/ChatContext";
import { getErrorMessage } from "../init/errorMessages";
import { useSignIn, useSignUp } from "../hooks/authHooks";

const Auth = ({ isOpen, onClose, type }) => {
  const [isLogin, setIsLogin] = useState(type == "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const { setShowAlert } = useContext(ChatContext);

  const { signIn, error: signInError } = useSignIn();
  const { signUp, error: signUpError } = useSignUp();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signIn(email, password);
        setShowAlert({ show: true, error: false, message: "Login successful" });
      } else {
        signUp(email, password, username);
        setShowAlert({
          show: true,
          error: false,
          message: "Signup successful",
        });
      }
      onClose();
    } catch (err) {
      const userFriendlyMessage = getErrorMessage(err.code);
      setError(userFriendlyMessage);
      setShowAlert({ show: true, error: true, message: userFriendlyMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={isLogin ? "Login" : "Sign Up"}
      isOpen={isOpen}
      onClose={onClose}
      showheader={false}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {signInError && (
            <p className="text-red-500 text-xs italic">{signInError}</p>
          )}
          {signUpError && (
            <p className="text-red-500 text-xs italic">{signUpError}</p>
          )}
          <div className="flex items-center justify-between">
            <button
              className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : isLogin ? (
                "Login"
              ) : (
                "Sign Up"
              )}
            </button>
            <a
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="#"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"}
            </a>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default Auth;
