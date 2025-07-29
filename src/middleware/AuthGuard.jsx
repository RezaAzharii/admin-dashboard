import { Navigate, useLocation, useOutlet } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "../constants/app.constant";

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isAuthenticated, isInitialized } = useAuthContext();
  const location = useLocation();

  if (!isInitialized) {
    return null; // atau <LoadingScreen />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${GHOST_ENTRY_PATH}?${REDIRECT_URL_KEY}=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <>{outlet}</>;
}
