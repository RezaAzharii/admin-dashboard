import { Navigate, useLocation, useOutlet } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "../constants/app.constant";

export default function AuthGuard() {
  const outlet = useOutlet();
  const { user,isAuthenticated, isInitialized } = useAuthContext();
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

  // contoh: cek adminOnly
  const route = location.pathname;
  if (
    route.includes("/dashboards/daftar-petugas") &&
    !user?.is_admin
  ) {
    // redirect ke home atau 403
    return <Navigate to="/dashboards/home" replace />;
  }

  // ❌ Hanya admin yang boleh akses pasar
  if (
    route.includes("/dashboards/pasar") &&
    !user?.is_admin
  ) {
    return <Navigate to="/dashboards/home" replace />;
  }

  return <>{outlet}</>;
}
