import { MapPin, Package, Activity } from "lucide-react";

/**
 * Komponen untuk menampilkan kartu statistik ringkasan.
 * @param {object} props - Properti komponen.
 * @param {object} props.stats - Objek statistik.
 */
export const StatCards = ({ stats }) => {
  const statList = [
    {
      title: "Total Pasar",
      value: stats?.totalPasar?.toString() || "0",
      icon: MapPin,
      color: "bg-blue-500",
    },
    {
      title: "Bahan Pokok",
      value: stats?.totalBahanPokok?.toString() || "0",
      icon: Package,
      color: "bg-purple-500",
    },
    {
      title: "Update Hari Ini",
      value: stats?.updateHariIni?.toString() || "0",
      icon: Activity,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {statList.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} rounded-lg p-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};