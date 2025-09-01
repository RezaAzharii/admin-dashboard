import { Package } from "lucide-react";

/**
 * Komponen untuk menampilkan daftar harga bahan pokok terkini.
 * @param {object} props - Properti komponen.
 * @param {Array<object>} props.prices - Array harga terbaru.
 */
export const LatestPrices = ({ prices }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Harga Bahan Pokok Terkini
      </h2>
      <div className="space-y-4">
        {prices.length > 0 ? (
          prices.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center">
                <Package className="mr-3 h-8 w-8 text-gray-500 dark:text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.nama}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    per {item.satuan}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Rp {parseInt(item.harga).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(item.updated_at).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">
            Tidak ada data harga tersedia
          </p>
        )}
      </div>
    </div>
  );
};