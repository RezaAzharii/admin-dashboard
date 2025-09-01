import { AlertTriangle } from "lucide-react";

/**
 * Komponen untuk menampilkan daftar peringatan.
 * @param {object} props - Properti komponen.
 * @param {Array<object>} props.alerts - Array objek peringatan.
 */
export const AlertsSection = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Notifikasi
      </h2>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-lg border-l-4 p-4 ${
              alert.type === "warning"
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                : alert.type === "info"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-green-500 bg-green-50 dark:bg-green-900/20"
            }`}
          >
            <div className="flex items-center">
              <AlertTriangle
                className={`mr-3 h-5 w-5 ${
                  alert.type === "warning"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : alert.type === "info"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-green-600 dark:text-green-400"
                }`}
              />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {alert.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};