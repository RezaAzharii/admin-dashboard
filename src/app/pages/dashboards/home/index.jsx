import { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  MapPin,
  Package,
  AlertTriangle,
  Clock,
  Activity,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
// Import the actual API configuration
import API from "configs/api.config";
import { useContext } from "react";
import AuthContext from "app/contexts/auth/authContext";

// Mock Page component for demonstration purposes, replace with your actual Page component
const Page = ({ title, children }) => (
  <div className="min-h-screen font-sans text-gray-900">
    <header className="p-4 shadow-md">
      <h1 className="text-center text-3xl font-bold text-gray-900">{title}</h1>
    </header>
    <main className="p-4">{children}</main>
  </div>
);

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // State untuk data real-time
  const [dashboardData, setDashboardData] = useState({
    hargaBapok: [],
    bahanPokok: [],
    pasar: [],
    petugas: [], // Changed to 'petugas' to match the data structure
    stats: {
      totalPasar: 0,
      totalBahanPokok: 0,
      updateHariIni: 0,
    },
  });

  // Update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data dari API dengan authentication
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken"); // Ambil token dari localStorage

      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        hargaResponse,
        bahanPokokResponse,
        pasarResponse,
        petugasResponse,
      ] = await Promise.all([
        axios.get(API.HARGA_BAPOK.INDEX, { headers }),
        axios.get(API.BAHAN_POKOK.INDEX, { headers }),
        axios.get(API.PASAR.INDEX, { headers }),
        axios.get(API.USERS.INDEX, { headers }),
      ]);

      const hargaData = hargaResponse.data;
      const bahanPokokData = bahanPokokResponse.data;

      const pasarData = Array.isArray(pasarResponse.data)
        ? pasarResponse.data
        : pasarResponse.data.data || [];

      const petugasData = Array.isArray(petugasResponse.data)
        ? petugasResponse.data
        : petugasResponse.data.data || [];

      // Hitung update hari ini
      const today = new Date().toISOString().split("T")[0];
      const updateHariIni = hargaData.filter(
        (item) => item.updated_at && item.updated_at.startsWith(today),
      ).length;

      setDashboardData({
        hargaBapok: hargaData,
        bahanPokok: bahanPokokData,
        pasar: pasarData,
        petugas: petugasData, // Ensure this matches the state key
        stats: {
          totalPasar: pasarData.length,
          totalBahanPokok: bahanPokokData.length,
          updateHariIni: updateHariIni,
        },
      });
    } catch (err) {
      console.error("Error fetching data:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        setError("Sesi Anda berakhir atau tidak sah. Silakan login kembali.");
        // Uncomment jika ingin redirect otomatis ke login
        // window.location.href = '/login';
      } else if (err.message.includes("Token tidak ditemukan")) {
        setError("Token tidak ditemukan. Silakan login kembali.");
      } else {
        setError("Gagal mengambil data dari server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data pertama kali dan setup auto-refresh
  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi untuk mendapatkan harga terbaru per bahan pokok
  const getLatestPrices = () => {
    const latestPrices = {};

    dashboardData.hargaBapok.forEach((item) => {
      const bahanPokok = dashboardData.bahanPokok.find(
        (bp) => bp.id === item.id_bahan_pokok,
      );
      if (bahanPokok) {
        const key = bahanPokok.nama;
        if (
          !latestPrices[key] ||
          new Date(item.updated_at) > new Date(latestPrices[key].updated_at)
        ) {
          latestPrices[key] = {
            ...item,
            nama: bahanPokok.nama,
            satuan: bahanPokok.satuan,
          };
        }
      }
    });

    return Object.values(latestPrices).slice(0, 5);
  };

  // Fungsi untuk mendapatkan update terbaru
  const getRecentUpdates = () => {
    return dashboardData.hargaBapok
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 4)
      .map((item) => {
        const bahanPokok = dashboardData.bahanPokok.find(
          (bp) => bp.id === item.id_bahan_pokok,
        );
        const pasar = dashboardData.pasar.find((p) => p.id === item.id_pasar);
        const petugas = dashboardData.petugas.find(
          (p) => p.name === item.created_by,
        );

        return {
          id: item.id,
          pasar: pasar?.nama || "Unknown",
          petugas: petugas?.name || item.created_by,
          waktu: new Date(item.updated_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          item: bahanPokok?.nama || "Unknown",
          harga: item.harga,
        };
      });
  };

  // Fungsi untuk generate chart data
  const getChartData = () => {
    const monthlyData = {};

    dashboardData.hargaBapok.forEach((item) => {
      const date = new Date(item.created_at);
      const monthKey = date.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { bulan: monthKey, totalHarga: 0, count: 0 };
      }

      monthlyData[monthKey].totalHarga += parseInt(item.harga);
      monthlyData[monthKey].count += 1;
    });

    return Object.values(monthlyData)
      .map((item) => ({
        bulan: item.bulan,
        harga: Math.round(item.totalHarga / item.count),
      }))
      .slice(-6);
  };

  // Generate alerts berdasarkan data real
  const generateAlerts = () => {
    const alerts = [];
    const latestPrices = getLatestPrices();

    // Alert untuk harga tinggi
    const expensiveItems = latestPrices.filter(
      (item) => parseInt(item.harga) > 50000,
    );
    if (expensiveItems.length > 0) {
      alerts.push({
        type: "warning",
        message: `${expensiveItems.length} bahan pokok memiliki harga > Rp 50.000`,
      });
    }

    // Alert untuk petugas yang belum update
    const today = new Date().toISOString().split("T")[0];
    const petugasUpdate = new Set(
      dashboardData.hargaBapok
        .filter((item) => item.updated_at.startsWith(today))
        .map((item) => item.created_by),
    );

    const petugasBelumUpdate = dashboardData.petugas.filter(
      (p) => p.is_petugas_pasar === 1 && !petugasUpdate.has(p.name),
    ).length;

    if (petugasBelumUpdate > 0) {
      alerts.push({
        type: "info",
        message: `${petugasBelumUpdate} petugas belum melakukan update hari ini`,
      });
    }

    // Alert untuk status data
    if (dashboardData.stats.updateHariIni > 0) {
      alerts.push({
        type: "success",
        message: `${dashboardData.stats.updateHariIni} update harga berhasil hari ini`,
      });
    }

    return alerts;
  };

  const stats = [
    {
      title: "Total Pasar",
      value: dashboardData.stats.totalPasar.toString(),
      icon: MapPin,
      color: "bg-blue-500",
    },
    {
      title: "Bahan Pokok",
      value: dashboardData.stats.totalBahanPokok.toString(),
      icon: Package,
      color: "bg-purple-500",
    },
    {
      title: "Update Hari Ini",
      value: dashboardData.stats.updateHariIni.toString(),
      icon: Activity,
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-white">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Page title="Dashboard Error">
        {" "}
        {/* Wrapped with Page component */}
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-red-600" />
            <p className="mb-4 text-red-600">Error: {error}</p>
            <button
              onClick={fetchData}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </Page>
    );
  }

  const latestPrices = getLatestPrices();
  const recentUpdates = getRecentUpdates();
  const chartData = getChartData();
  const alerts = generateAlerts();

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
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
            <div className="flex justify-end">
              <button
                onClick={fetchData}
                className="mb-2 flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Waktu Server
            </p>
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

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
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
      </div>

      {/* Alert Section */}
      {alerts.length > 0 && (
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
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Harga Terkini */}
        <div className="lg:col-span-2">
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              Harga Bahan Pokok Terkini
            </h2>
            <div className="space-y-4">
              {latestPrices.length > 0 ? (
                latestPrices.map((item, index) => (
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

          {/* Grafik Tren Harga */}
          {chartData.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                Tren Harga Rata-rata
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
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
                  <Line
                    type="monotone"
                    dataKey="harga"
                    stroke="#3B82F6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Update Terbaru */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              Update Terbaru
            </h2>
            <div className="space-y-4">
              {recentUpdates.length > 0 ? (
                recentUpdates.map((update, index) => (
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
        </div>
      </div>
    </div>
  );
}
