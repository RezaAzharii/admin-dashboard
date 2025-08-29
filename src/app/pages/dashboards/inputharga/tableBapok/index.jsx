import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API from "configs/api.config";
import AuthContext from "app/contexts/auth/authContext";
import { useContext } from "react";

const HargaBapokTable = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [dataHarga, setDataHarga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [formData, setFormData] = useState({
    id: null,
    id_pasar: "",
    id_bahan_pokok: "",
    tanggal: "",
    harga: "",
    stok: "",
    status_integrasi: "pending",
  });

  const [listPasar, setListPasar] = useState([]);
  const [listBahanPokok, setListBahanPokok] = useState([]);
const [stokError, setStokError] = useState("");
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [hargaError, setHargaError] = useState("");

  useEffect(() => {
    if (!dataHarga || dataHarga.length === 0) return;

    const filtered = dataHarga.filter((item) => {
      // normalisasi tanggal ke YYYY-MM-DD
      const itemDate = new Date(item.tanggal).toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
      });
      return itemDate === selectedDate;
    });

    setFilteredData(filtered);
  }, [selectedDate, dataHarga, currentUser]);

  useEffect(() => {
    if (currentUser) {
      // console.log("Current user from AuthContext:", currentUser);
      fetchDataHarga();
      fetchListDependencies();
    }
  }, [selectedDate, currentUser]);

  const fetchDataHarga = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      let url = API.HARGA_BAPOK.INDEX;
      let params = {
        tanggal: selectedDate, // <-- Kirim tanggal yang dipilih ke backend
      };

      if (currentUser?.is_petugas_pasar && currentUser.id_pasar) {
        params.id_pasar = currentUser.id_pasar;
        console.log(
          `Fetching data for pasar ${currentUser.id_pasar} (${currentUser.name})`,
        );
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params, // Kirim parameter filter
      });

      // console.log("Data received:", response.data);
      setDataHarga(response.data);
    } catch (err) {
      setError("Gagal mengambil data harga bahan pokok.");
      console.error("Error fetching data:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Sesi Berakhir",
          text: "Sesi Anda berakhir atau tidak sah. Silakan login kembali.",
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
      const headers = { Authorization: `Bearer ${token}` };

      if (modalType === "add") {
        await axios.post(API.HARGA_BAPOK.STORE, formData, { headers });
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
        status_integrasi: "pending",
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    setModalType("add");
    setFormData({
      id: null,
      id_pasar: currentUser?.is_petugas_pasar
        ? currentUser.id_pasar.toString()
        : "",
      id_bahan_pokok: "",
      tanggal: today,
      harga: "",
      stok: "",
      status_integrasi: "pending",
    });
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setModalType("edit");

    // konversi tanggal sesuai format Asia/Jakarta ke YYYY-MM-DD
    const formattedDate = new Date(item.tanggal).toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    setFormData({
      id: item.id,
      id_pasar: item.id_pasar,
      id_bahan_pokok: item.id_bahan_pokok,
      tanggal: formattedDate, // sudah konsisten dengan filter
      harga: item.harga,
      stok: item.stok,
      status_integrasi: item.status_integrasi,
    });

    setShowModal(true);
  };

  const handleApproveClick = async (id) => {
    Swal.fire({
      title: "Setujui Data?",
      text: "Apakah Anda yakin ingin menyetujui data ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Setujui",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const token = localStorage.getItem("authToken");
          const selectedItem = dataHarga.find((item) => item.id === id);

          if (!selectedItem) throw new Error("Data tidak ditemukan");

          const payload = {
            id_pasar: selectedItem.id_pasar,
            id_bahan_pokok: selectedItem.id_bahan_pokok,
            tanggal: new Date(selectedItem.tanggal).toLocaleDateString(
              "en-CA",
              { timeZone: "Asia/Jakarta" },
            ),
            harga: parseInt(selectedItem.harga),
            harga_baru: parseInt(selectedItem.harga_baru || selectedItem.harga), // fallback
            stok: parseInt(selectedItem.stok),
            status_integrasi: "approve",
          };

          await axios.put(API.HARGA_BAPOK.UPDATE(id), payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          Swal.fire("Berhasil!", "Data telah disetujui.", "success");
          fetchDataHarga();
        } catch (err) {
          console.error("Gagal menyetujui data:", err);
          Swal.fire(
            "Gagal!",
            "Terjadi kesalahan saat menyetujui data.",
            "error",
          );
        } finally {
          setLoading(false);
        }
      }
    });
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
        className="mx-1 rounded border border-gray-600 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700"
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
              : "border-gray-600 bg-gray-50 text-gray-900 hover:bg-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
        className="mx-1 rounded border border-gray-600 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100"
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="dark:text-dark-50 text-2xl font-bold text-gray-800">
          Daftar Harga Bahan Pokok
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-gray-100"
          />

          <button
            onClick={handleAddClick}
            className="transform rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700"
          >
            + Tambah Data
          </button>
        </div>
      </div>

      {/* Show entries selector */}
      <div className="dark:text-dark-50 mb-4 flex items-center text-gray-800">
        <span className="mr-2">Tampilkan</span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="dark:text-dark-50 rounded border border-gray-600 bg-gray-50 px-3 py-1 text-gray-800 focus:border-blue-500 focus:outline-none dark:bg-gray-700"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="dark:text-dark-50 ml-2 text-gray-800">
          data per halaman
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                #
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                dibuat oleh
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                Pasar
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                Bahan Pokok
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                Tanggal
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                Harga
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                % Perubahan
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                Stok
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                Status
              </th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {currentData.map((item, index) => {
              // Debugging: Tampilkan warning jika ada data dari pasar lain
              if (
                currentUser?.is_petugas_pasar &&
                item.id_pasar != currentUser.id_pasar
              ) {
                console.warn("Data tidak sesuai filter:", item);
                return null;
              }

              return (
                <tr
                  key={item.id}
                  className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {item.created_by || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {item.pasar ? item.pasar.nama : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {item.bahan_pokok ? item.bahan_pokok.nama : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(item.tanggal).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    Rp {parseFloat(item.harga).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.change_status === "up" && (
                      <span className="text-red-600 dark:text-red-400">
                        ▲ {item.change_percent}%
                      </span>
                    )}
                    {item.change_status === "down" && (
                      <span className="text-green-600 dark:text-green-400">
                        ▼ {item.change_percent}%
                      </span>
                    )}
                    {item.change_status === "same" && (
                      <span className="text-gray-600 dark:text-gray-300">
                        {item.change_percent}%
                      </span>
                    )}
                    {item.change_status === "N/A" && "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {item.stok}{" "}
                    {item.bahan_pokok ? item.bahan_pokok.satuan : ""}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.status_integrasi === "approve"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                          : item.status_integrasi === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {item.status_integrasi === "approve"
                        ? "Disetujui"
                        : item.status_integrasi === "pending"
                          ? "Pending"
                          : item.status_integrasi}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      {item.status_integrasi === "pending" &&
                        !currentUser?.is_petugas_pasar && (
                          <button
                            onClick={() => handleApproveClick(item.id)}
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-green-100 px-3 text-green-800 transition-all duration-200 hover:bg-green-200 dark:bg-green-600/20 dark:text-green-400 dark:hover:bg-green-600/30 dark:hover:text-green-300"
                          >
                            Setujui
                          </button>
                        )}
                      <button
                        onClick={() => handleEditClick(item)}
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-yellow-100 px-3 text-yellow-800 transition-all duration-200 hover:bg-yellow-200 dark:bg-yellow-600/20 dark:text-yellow-300 dark:hover:bg-yellow-600/30 dark:hover:text-yellow-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-red-100 px-3 text-red-800 transition-all duration-200 hover:bg-red-200 dark:bg-red-600/20 dark:text-red-300 dark:hover:bg-red-600/30 dark:hover:text-red-300"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            {/* Modal Header */}
            <div className="rounded-t-xl border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {modalType === "add"
                    ? "Tambah Data Harga"
                    : "Edit Data Harga"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 transition-colors duration-150 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Pasar{" "}
                    <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <select
                    name="id_pasar"
                    value={formData.id_pasar}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    required
                    disabled={currentUser?.is_petugas_pasar}
                  >
                    <option value="">Pilih Pasar</option>
                    {listPasar.map((pasar) => (
                      <option key={pasar.id} value={pasar.id}>
                        {pasar.nama}
                      </option>
                    ))}
                  </select>
                  {currentUser?.is_petugas_pasar && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400"></p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bahan Pokok{" "}
                    <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <select
                    name="id_bahan_pokok"
                    value={formData.id_bahan_pokok}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tanggal{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Harga (Rp){" "}
                    <span className="text-red-500 dark:text-red-400">*</span>
                  </label>

                  <input
                    type="text"
                    name="harga"
                    value={formatRupiah(formData.harga)}
                    onChange={(e) => {
                      const value = unformatRupiah(e.target.value);
                      const numericValue = parseInt(value, 10);

                      if (numericValue === 0 || /^0[0-9]*$/.test(value)) {
                        setHargaError("Harga tidak boleh diisi 0");
                      } else {
                        setHargaError("");
                        setFormData((prev) => ({
                          ...prev,
                          harga: value,
                        }));
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Masukkan harga"
                    required
                  />
                  {hargaError && (
                    <p className="mt-1 text-sm text-red-500">{hargaError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Stok{" "}
                    <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="stok"
                    value={formData.stok}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);

                      if (!value || value <= 0) {
                        setStokError("Stok minimal 1");
                      } else {
                        setStokError("");
                        setFormData((prev) => ({
                          ...prev,
                          stok: value,
                        }));
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="0"
                    required
                  />
                  {stokError && (
                    <p className="mt-1 text-sm text-red-500">{stokError}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-500 px-4 py-2 font-medium text-white transition-colors duration-150 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
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
