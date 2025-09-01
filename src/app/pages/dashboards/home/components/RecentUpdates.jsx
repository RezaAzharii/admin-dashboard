import { Clock } from "lucide-react";

/**
 * Komponen untuk menampilkan daftar update harga terbaru.
 * @param {object} props - Properti komponen.
 * @param {Array<object>} props.updates - Array update terbaru.
 */
export const RecentUpdates = ({ updates }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Update Terbaru
      </h2>
      <div className="space-y-4">
        {updates.length > 0 ? (
          updates.map((update, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <Clock className="mt-0.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {update.pasar}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {update.petugas} • {update.waktu}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {update.item}
                </p>
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  Rp {parseInt(update.harga).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-gray-500 dark:text-gray-400">
            Tidak ada update terbaru
          </p>
        )}
      </div>
    </div>
  );
};