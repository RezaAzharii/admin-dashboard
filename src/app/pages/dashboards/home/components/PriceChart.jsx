import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

/**
 * Komponen untuk menampilkan grafik tren harga.
 * @param {object} props - Properti komponen.
 * @param {Array<object>} props.data - Data untuk grafik.
 */
export const PriceChart = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Tren Harga Rata-rata
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-600"
          />
          <XAxis
            dataKey="bulan"
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
          />
          <YAxis
            stroke="currentColor"
            className="text-gray-500 dark:text-gray-400"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              color: "#111827",
              borderRadius: "8px",
            }}
            wrapperClassName="dark:[&>.recharts-tooltip-wrapper]:!bg-gray-800 dark:[&>.recharts-tooltip-wrapper]:!border-gray-600 dark:[&>.recharts-tooltip-wrapper]:!text-white"
            formatter={(value) => [
              `Rp ${value.toLocaleString("id-ID")}`,
              "Harga Rata-rata",
            ]}
          />
          <Line type="monotone" dataKey="harga" stroke="#3B82F6" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};