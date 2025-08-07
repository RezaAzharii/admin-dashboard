import { useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import isObject from "lodash/isObject";
import isString from "lodash/isString";
import axios from "utils/axios";
import { setSession } from "utils/jwt";
import AuthContext from "./authContext";

// --- State awal ---
const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
};

// --- Reducer handlers ---
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

// --- Reducer utama ---
const reducer = (state, action) => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      // console.log("🔄 AuthProvider init running...");

      try {
        const authToken = localStorage.getItem("authToken");
        // console.log("🧩 Auth token from localStorage:", authToken);

        if (authToken) {
          setSession(authToken);
          // console.log("📡 Fetching /user/me from API with token...");

          const response = await axios.get("/user/me");
          // console.log("✅ Full /user response:", response.data);

          // Ambil data user dari response.data.data
          const user = response.data?.data;

          if (isObject(user)) {
            // console.log("✅ Loaded user data:", user);
            dispatch({
              type: "INITIALIZE",
              payload: { isAuthenticated: true, user },
            });
          } else {
            // console.warn("⚠️ User data invalid → clearing session...");
            setSession(null);
            localStorage.removeItem("authToken");
            dispatch({
              type: "INITIALIZE",
              payload: { isAuthenticated: false, user: null },
            });
          }
        } else {
          // console.log("❌ No auth token found → user is not authenticated");
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        console.error("🚨 INIT error:", err);
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

  // --- Fungsi login ---
  const login = async ({ email, password }) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      console.log("🔑 Attempting login...");
      const response = await axios.post("/login", { email, password });
      // console.log("✅ Login response:", response.data);

      const { access_token, user } = response.data;

      if (!isString(access_token) || !isObject(user)) {
        throw new Error("Invalid response format from login");
      }

      setSession(access_token);
      localStorage.setItem("authToken", access_token);
      // console.log("📝 Token saved to localStorage:", access_token);

      dispatch({ type: "LOGIN_SUCCESS", payload: { user } });
    } catch (err) {
      console.error("❌ Login error:", err);
      dispatch({
        type: "LOGIN_ERROR",
        payload: { errorMessage: err?.message || "Login failed" },
      });
    }
  };

  // --- Fungsi logout ---
  const logout = () => {
    // console.log("🚪 Logging out...");
    setSession(null);
    localStorage.removeItem("authToken");
    dispatch({ type: "LOGOUT" });
    window.location.reload(); // opsional: reset semua state global
  };

  // --- Saat init belum selesai, tampilkan loading/null ---
  if (!state.isInitialized) {
    // console.log("⏳ Waiting for init...");
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
