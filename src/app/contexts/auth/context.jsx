// src/app/contexts/auth/context.jsx
import { useContext } from "react";
import AuthContext from "./authContext";

// Hook untuk mengakses context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext harus digunakan dalam AuthProvider");
  }
  return context;
};
