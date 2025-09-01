import { useContext } from "react";
import AuthContext from "app/contexts/auth/authContext";

/**
 * Komponen header dashboard yang menampilkan judul dan waktu saat ini.
 * @param {object} props - Properti komponen.
 * @param {Date} props.currentTime - Waktu saat ini.
 */
export const DashboardHeader = ({ currentTime }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {user?.is_admin
            ? "Dashboard Admin"
            : user?.is_petugas_pasar
            ? "Dashboard Petugas Pasar"
            : "Dashboard"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sistem Monitoring Harga Bahan Pokok
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600 dark:text-gray-400">Waktu Server</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentTime.toLocaleTimeString("id-ID")}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentTime.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};