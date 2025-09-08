  

import { useState, useEffect } from "react";
import { Page } from "components/shared/Page";
import { useQuery } from "@tanstack/react-query";   
import { fetchDashboardData } from "app/services/dashboardService";
import { DashboardHeader } from "./components/DashboardHeader";
import { StatCards } from "./components/StatCards";
import { AlertsSection } from "./components/AlertsSection";
import { LatestPrices } from "./components/LatestPrices";
import { PriceChart } from "./components/PriceChart";
import { RecentUpdates } from "./components/RecentUpdates";
import { subscribeToDataUpdates } from "../../../services/utils/dashboardEvents";


export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  

  useEffect(() => {
    document.title = "Beranda";
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });


  
  useEffect(() => {
    const unsubscribe = subscribeToDataUpdates(() => {
      // console.log("Data update triggered, refetching...");
      refetch();
    });

    return unsubscribe;
  }, [refetch]);

  
  useEffect(() => {
    if (dashboardData) {
      // console.log("Data Dashboard Berhasil Dimuat: ✅");
      // console.log("-----------------------------------");
      // console.log("Harga Bahan Pokok:", dashboardData.hargaBapok);
      // console.log("Bahan Pokok:", dashboardData.bahanPokok);
      // console.log("Pasar:", dashboardData.pasar);
      // console.log("Petugas:", dashboardData.petugas);
      // console.log("Statistik:", dashboardData.stats);
      // console.log("-----------------------------------");
    }
  }, [dashboardData]);

    
  const getLatestPrices = () => {
    const latestPrices = {};
    if (!dashboardData?.hargaBapok || !dashboardData?.bahanPokok) return [];

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

  
  const getRecentUpdates = () => {
    if (!dashboardData?.hargaBapok) return [];

    return dashboardData.hargaBapok
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 4)
      .map((item) => {
        const bahanPokok = dashboardData?.bahanPokok?.find(
          (bp) => bp.id === item.id_bahan_pokok,
        );
        const pasar = dashboardData?.pasar?.find((p) => p.id === item.id_pasar);
        const petugas = dashboardData?.petugas?.find(
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

  
  const getChartData = () => {
    const monthlyData = {};
    if (!dashboardData?.hargaBapok) return [];

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

  
  const generateAlerts = () => {
    const alerts = [];
    if (!dashboardData) return alerts;

    const latestPrices = getLatestPrices();

    
    const expensiveItems = latestPrices.filter(
      (item) => parseInt(item.harga) > 50000,
    );
    if (expensiveItems.length > 0) {
      alerts.push({
        type: "warning",
        message: `${expensiveItems.length} bahan pokok memiliki harga > Rp 50.000`,
      });
    }

    
    const today = new Date().toISOString().split("T")[0];
    const petugasUpdate = new Set(
      dashboardData.hargaBapok
        ?.filter((item) => item.updated_at.startsWith(today))
        .map((item) => item.created_by),
    );

    const petugasBelumUpdate = dashboardData.petugas?.filter(
      (p) => p.is_petugas_pasar === 1 && !petugasUpdate.has(p.name),
    ).length;

    if (petugasBelumUpdate > 0) {
      alerts.push({
        type: "info",
        message: `${petugasBelumUpdate} petugas belum melakukan update hari ini`,
      });
    }

    
    if (dashboardData.stats?.updateHariIni > 0) {
      alerts.push({
        type: "success",
        message: `${dashboardData.stats.updateHariIni} update harga berhasil hari ini`,
      });
    }

    return alerts;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-300">Memuat data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-red-500">
        <p>{error?.message || "Gagal mengambil data dari server."}</p>
      </div>
    );
  }

  const latestPrices = getLatestPrices();
  const recentUpdates = getRecentUpdates();
  const chartData = getChartData();
  const alerts = generateAlerts();

  return (
    <Page title="Beranda">
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-dark-900">
        <DashboardHeader currentTime={currentTime} />
        <StatCards stats={dashboardData.stats} />
        <AlertsSection alerts={alerts} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <LatestPrices prices={latestPrices} />
            <PriceChart data={chartData} />
          </div>
          <div className="space-y-8">
            <RecentUpdates updates={recentUpdates} />
          </div>
        </div>
      </div>
    </Page>
  );
}