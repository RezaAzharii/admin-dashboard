  
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import axios from "axios";
import API from "configs/api.config";

const HargaBapokModal = ({
  showModal,
  modalType,
  formData,
  setFormData,
  onClose,
  listPasar,
  listBahanPokok,
  onSuccess,
  currentUser,
}) => {
  const [hargaError, setHargaError] = useState("");
  const [stokError, setStokError] = useState("");

  const hargaMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };
      if (modalType === "add") {
        return await axios.post(API.HARGA_BAPOK.STORE, data, { headers });
      } else {
        return await axios.put(API.HARGA_BAPOK.UPDATE(data.id), data, {
          headers,
        });
      }
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data berhasil ${modalType === "add" ? "ditambahkan" : "diperbarui"}!`,
      });
      onSuccess(); 
    },
    onError: (error) => {
      console.error("Gagal menyimpan data:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.",
      });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHargaChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); 
    const numericValue = parseInt(value, 10);
    setHargaError(numericValue === 0 ? "Harga tidak boleh diisi 0" : "");
    setFormData((prev) => ({ ...prev, harga: value }));
  };

  const handleStokChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = parseInt(value, 10);
    setStokError(numericValue < 1 ? "Stok minimal 1" : "");
    setFormData((prev) => ({ ...prev, stok: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id_pasar || !formData.id_bahan_pokok || !formData.tanggal || !formData.harga || !formData.stok) {
      Swal.fire({ icon: "warning", title: "Input Tidak Lengkap", text: "Pastikan semua data terisi." });
      return;
    }
    if (hargaError || stokError) return;
    hargaMutation.mutate(formData);
  };

  if (!showModal) return null;

  return (
    <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-dark-900">
        <div className="rounded-t-xl border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-dark-900">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {modalType === "add" ? "Tambah Data Harga" : "Edit Data Harga"}
            </h3>
            <button onClick={onClose} className="text-gray-500 transition-colors duration-150 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Pasar <span className="text-red-500 dark:text-red-400">*</span></label>
              <select name="id_pasar" value={formData.id_pasar} onChange={handleChange} disabled={currentUser?.is_petugas_pasar} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100">
                <option value="">Pilih Pasar</option>
                {listPasar.map((pasar) => (<option key={pasar.id} value={pasar.id}>{pasar.nama}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Bahan Pokok <span className="text-red-500 dark:text-red-400">*</span></label>
              <select name="id_bahan_pokok" value={formData.id_bahan_pokok} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100">
                <option value="">Pilih Bahan Pokok</option>
                {listBahanPokok.map((bahan) => (<option key={bahan.id} value={bahan.id}>{bahan.nama}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal <span className="text-red-500 dark:text-red-400">*</span></label>
            <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required max={new Date().toISOString().split("T")[0]} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"/>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Harga (Rp) <span className="text-red-500 dark:text-red-400">*</span></label>
              <input type="text" name="harga" value={formData.harga ? parseFloat(formData.harga).toLocaleString('id-ID') : ''} onChange={handleHargaChange} placeholder="Masukkan harga" required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"/>
              {hargaError && (<p className="mt-1 text-sm text-red-500">{hargaError}</p>)}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Stok <span className="text-red-500 dark:text-red-400">*</span></label>
              <input type="number" name="stok" value={formData.stok} onChange={handleStokChange} placeholder="0" required className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"/>
              {stokError && (<p className="mt-1 text-sm text-red-500">{stokError}</p>)}
            </div>
          </div>
          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-600">
            <button type="button" onClick={onClose} className="rounded-lg bg-gray-500 px-4 py-2 font-medium text-white transition-colors duration-150 hover:bg-gray-600 dark:bg-dark-900 dark:hover:bg-gray-700">Batal</button>
            <button type="submit" disabled={hargaMutation.isPending} className="flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {hargaMutation.isPending && (<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>)}
              {modalType === "add" ? "Tambah" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HargaBapokModal;