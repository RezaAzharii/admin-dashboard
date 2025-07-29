import { useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import isObject from "lodash/isObject";
import isString from "lodash/isString";
import axios from "utils/axios";
import { setSession } from "utils/jwt";
import AuthContext from "./authContext";

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
    errorMessage: null,
  }),
  LOGIN_ERROR: (state, action) => ({
    ...state,
    isLoading: false,
    errorMessage: action.payload.errorMessage,
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
      console.log("AuthProvider init running...");

      try {
        const authToken = localStorage.getItem("authToken");
        console.log("Auth token from localStorage:", authToken);

        if (authToken) {
          setSession(authToken);

          const response = await axios.get("/user");
          const { user } = response.data;

          if (isObject(user)) {
            console.log("User data loaded from API:", user);

            dispatch({
              type: "INITIALIZE",
              payload: { isAuthenticated: true, user },
            });
          } else {
            console.warn("User data is invalid, clearing session...");
            setSession(null);
            localStorage.removeItem("authToken");
            dispatch({
              type: "INITIALIZE",
              payload: { isAuthenticated: false, user: null },
            });
          }
        } else {
          console.log("No auth token found → redirect to login");
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        console.error("INIT error:", err);
        setSession(null);
        localStorage.removeItem("authToken");
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
      console.log("Login response:", response.data);

      const { access_token, user } = response.data;

      if (!isString(access_token) || !isObject(user)) {
        throw new Error("Invalid response format from login");
      }

      setSession(access_token);
      localStorage.setItem("authToken", access_token);

      dispatch({ type: "LOGIN_SUCCESS", payload: { user } });
    } catch (err) {
      console.error("Login error:", err);
      dispatch({
        type: "LOGIN_ERROR",
        payload: { errorMessage: err?.message || "Login failed" },
      });
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("authToken");
    dispatch({ type: "LOGOUT" });
    window.location.reload(); // opsional, jika ingin reset semua state global
  };

  if (!state.isInitialized) {
    return null; // Atau <LoadingScreen /> agar UX lebih baik
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
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
