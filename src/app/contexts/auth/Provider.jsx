// src/app/contexts/auth/Provider.jsx

import { useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import isObject from "lodash/isObject";
import isString from "lodash/isString";

import axios from "utils/axios";
import { isTokenValid, setSession } from "utils/jwt";
import AuthContext from "./authContext";

// --------------------------------------------

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
};

const reducerHandlers = {
  INITIALIZE: (state, action) => ({
    ...state,
    isAuthenticated: action.payload.isAuthenticated,
    isInitialized: true,
    user: action.payload.user,
  }),
  LOGIN_REQUEST: (state) => ({ ...state, isLoading: true }),
  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user: action.payload.user,
  }),
  LOGIN_ERROR: (state, action) => ({
    ...state,
    errorMessage: action.payload.errorMessage,
    isLoading: false,
  }),
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

const reducer = (state, action) => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const authToken = window.localStorage.getItem("authToken");

        if (authToken && isTokenValid(authToken)) {
          setSession(authToken);
          const response = await axios.get("/user");
          const { user } = response.data;

          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: true, user },
          });
        } else {
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: "INITIALIZE",
          payload: { isAuthenticated: false, user: null },
        });
      }
    };

    init();
  }, []);

const login = async ({ email, password }) => {
  dispatch({ type: "LOGIN_REQUEST" });

  try {
    const response = await axios.post("/login", { email, password });
    const { access_token, user } = response.data;

    if (!isString(access_token) || !isObject(user)) {
      throw new Error("Invalid response format");
    }

    setSession(access_token);

    // Simpan role ke local storage
    localStorage.setItem("role", user.role);

    dispatch({
      type: "LOGIN_SUCCESS",
      payload: { user },
    });
  } catch (err) {
    dispatch({
      type: "LOGIN_ERROR",
      payload: {
        errorMessage: err?.message || "Login failed",
      },
    });
  }
};


  const logout = () => {
  setSession(null);
  localStorage.removeItem("role"); // bersihkan role dari local storage
  dispatch({ type: "LOGOUT" });
};


  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
