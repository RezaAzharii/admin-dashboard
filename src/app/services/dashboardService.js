// src/app/services/dashboardService.js

import axios from "axios";
import API from "configs/api.config";

// Helper function to extract data from axios response
const extractData = (response) => {
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
};

/**
 * Mengambil semua data dashboard dari API.
 * @returns {Promise<object>} Objek yang berisi semua data dashboard.
 */
export const fetchDashboardData = async () => {
  const token = localStorage.getItem("authToken");

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

  const hargaData = extractData(hargaResponse);
  const bahanPokokData = extractData(bahanPokokResponse);
  const pasarData = extractData(pasarResponse);
  const petugasData = extractData(petugasResponse);

  // Calculate today's updates
  const today = new Date().toISOString().split("T")[0];
  const updateHariIni = hargaData.filter(
    (item) => item.updated_at && item.updated_at.startsWith(today),
  ).length;

  return {
    hargaBapok: hargaData,
    bahanPokok: bahanPokokData,
    pasar: pasarData,
    petugas: petugasData,
    stats: {
      totalPasar: pasarData.length,
      totalBahanPokok: bahanPokokData.length,
      updateHariIni: updateHariIni,
    },
  };
};