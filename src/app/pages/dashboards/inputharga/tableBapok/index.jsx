import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API from "configs/api.config"; // Pastikan path ini benar sesuai struktur proyek Anda

const HargaBapokTable = () => {
  const [dataHarga, setDataHarga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    id_pasar: "",
    id_bahan_pokok: "",
    tanggal: "",
    harga: "",
    stok: "",
    status_integrasi: "offline", // Default value
  });

  // State untuk menyimpan daftar Pasar dan Bahan Pokok untuk dropdown di modal
  const [listPasar, setListPasar] = useState([]);
  const [listBahanPokok, setListBahanPokok] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetchDataHarga();
    fetchListDependencies(); // Memuat daftar pasar dan bahan pokok saat komponen dimuat
  }, []);

  useEffect(() => {
    setFilteredData(dataHarga);
  }, [dataHarga]);

  const fetchDataHarga = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken"); // Ambil token dari localStorage
      const response = await axios.get(API.HARGA_BAPOK.INDEX, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDataHarga(response.data);
    } catch (err) {
      setError("Gagal mengambil data harga bahan pokok.");
      console.error("Error fetching data:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Sesi Berakhir",
          text: "Sesi Anda berakhir atau tidak sah. Silakan login kembali.",
        }).then(() => {
          // window.location.href = '/login';
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchListDependencies = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Ambil daftar Pasar
      const pasarResponse = await axios.get(API.PASAR.INDEX, { headers });
      setListPasar(pasarResponse.data);

      // Ambil daftar Bahan Pokok
      const bahanPokokResponse = await axios.get(API.BAHAN_POKOK.INDEX, {
        headers,
      });
      setListBahanPokok(bahanPokokResponse.data);
    } catch (err) {
      console.error(
        "Gagal mengambil daftar pasar atau bahan pokok:",
        err.response?.data || err.message,
      );
      // Anda bisa menambahkan penanganan error yang lebih spesifik jika diperlukan
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.id_pasar ||
      !formData.id_bahan_pokok ||
      !formData.tanggal ||
      !formData.harga ||
      !formData.stok
    ) {
      Swal.fire({
        icon: "warning",
        title: "Input Tidak Lengkap",
        text: "Pastikan semua data (Pasar, Bahan Pokok, Tanggal, Harga, Stok) terisi.",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (modalType === "add") {
        await axios.post(API.HARGA_BAPOK.STORE, formData, {
          headers,
        });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil ditambahkan!",
        });
      } else {
        await axios.put(API.HARGA_BAPOK.UPDATE(formData.id), formData, {
          headers,
        });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil diperbarui!",
        });
      }

      setShowModal(false);
      setFormData({
        id: null,
        id_pasar: "",
        id_bahan_pokok: "",
        tanggal: "",
        harga: "",
        stok: "",
        status_integrasi: "offline",
      });

      await fetchDataHarga();
    } catch (error) {
      console.error(
        "Gagal menyimpan data:",
        error.response?.data || error.message,
      );
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data.",
      });
      if (error.response?.status === 401) {
        // window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    const today = new Date().toISOString().split("T")[0];

    setModalType("add");
    setFormData({
      id: null,
      id_pasar: "",
      id_bahan_pokok: "",
      tanggal: today,
      harga: "",
      stok: "",
      status_integrasi: "offline",
    });
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setModalType("edit");
    setFormData({
      id: item.id,
      id_pasar: item.id_pasar,
      id_bahan_pokok: item.id_bahan_pokok,
      tanggal: item.tanggal.split("T")[0],
      harga: item.harga,
      stok: item.stok,
      status_integrasi: item.status_integrasi,
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const token = localStorage.getItem("authToken");
          await axios.delete(API.HARGA_BAPOK.DELETE(id), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          Swal.fire({
            icon: "success",
            title: "Dihapus!",
            text: "Data berhasil dihapus.",
          });
          fetchDataHarga();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Gagal menghapus data.",
          });
          console.error(
            "Error deleting data:",
            err.response?.data || err.message,
          );
          if (err.response?.status === 401) {
            // window.location.href = '/login';
          }
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const formatRupiah = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const unformatRupiah = (value) => {
    return value.replace(/\./g, "").replace(/\D/g, "");
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mx-1 rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ‹
      </button>,
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 rounded border px-3 py-2 text-sm font-medium ${
            currentPage === i
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {i}
        </button>,
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="mx-1 rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ›
      </button>,
    );

    return buttons;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-300">Memuat data...</span>
      </div>
    );
  }

  if (error) {
    return <div className="py-4 text-center text-red-400">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 text-gray-100">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">
          Daftar Harga Bahan Pokok
        </h2>
        <button
          onClick={handleAddClick}
          className="transform rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700"
        >
          + Tambah Data
        </button>
      </div>

      {/* Show entries selector */}
      <div className="mb-4 flex items-center text-white">
        <span className="mr-2">Tampilkan</span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="rounded border border-gray-600 bg-gray-700 px-3 py-1 text-gray-100 focus:border-blue-500 focus:outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="ml-2">data per halaman</span>
      </div>

      <div className="overflow-x-auto rounded-lg bg-gray-800 shadow-xl">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                #
              </th>
              <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                dibuat oleh
              </th>
              <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Pasar
              </th>
              <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Bahan Pokok
              </th>
              <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Tanggal
              </th>
              <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Harga
              </th>
              <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Stok
              </th>
              <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Status
              </th>
              <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentData.map((item, index) => (
              <tr
                key={item.id}
                className="transition-colors duration-150 hover:bg-gray-700"
              >
                <td className="px-4 py-3 text-sm text-gray-300">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {item.created_by || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {item.pasar ? item.pasar.nama : "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {item.bahan_pokok ? item.bahan_pokok.nama : "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(item.tanggal).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  Rp {parseFloat(item.harga).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {item.stok} {item.bahan_pokok ? item.bahan_pokok.satuan : ""}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      item.status_integrasi === "online"
                        ? "bg-green-800 text-green-200"
                        : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {item.status_integrasi}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-600/20 px-10 text-yellow-400 transition-all duration-200 group-hover:scale-110 hover:bg-yellow-600/30 hover:text-yellow-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 px-10 text-red-400 transition-all duration-200 group-hover:scale-110 hover:bg-red-600/30 hover:text-red-300"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-white">
          Menampilkan {startIndex + 1} -{" "}
          {Math.min(endIndex, filteredData.length)} dari {filteredData.length}{" "}
          data
        </div>
        <div className="flex items-center">{renderPaginationButtons()}</div>
      </div>

      {/* Enhanced Modal Tambah/Edit */}
      {showModal && (
        <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-gray-800 shadow-2xl">
            {/* Modal Header */}
            <div className="rounded-t-xl border-b border-gray-600 bg-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-100">
                  {modalType === "add"
                    ? "Tambah Data Harga"
                    : "Edit Data Harga"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 transition-colors duration-150 hover:text-gray-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Pasar <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="id_pasar"
                    value={formData.id_pasar}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Pilih Pasar</option>
                    {listPasar.map((pasar) => (
                      <option key={pasar.id} value={pasar.id}>
                        {pasar.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Bahan Pokok <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="id_bahan_pokok"
                    value={formData.id_bahan_pokok}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Pilih Bahan Pokok</option>
                    {listBahanPokok.map((bahan) => (
                      <option key={bahan.id} value={bahan.id}>
                        {bahan.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Tanggal <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Harga (Rp) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="harga"
                    value={formatRupiah(formData.harga)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        harga: unformatRupiah(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Masukkan harga"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Stok <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="stok"
                    value={formData.stok}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Status Integrasi
                </label>
                <select
                  name="status_integrasi"
                  value={formData.status_integrasi}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 border-t border-gray-600 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition-colors duration-150 hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  )}
                  {modalType === "add" ? "Tambah" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HargaBapokTable;