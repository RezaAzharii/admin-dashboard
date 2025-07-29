import { useEffect, useState } from "react";
import axios from "axios";
import API from "configs/api.config";
import { Page } from "components/shared/Page";
import Swal from "sweetalert2";

export default function BahanPokok() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    urutan: "",
    nama: "",
    satuan: "",
    stok_wajib: "",
    up_stok: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [deletePhoto, setDeletePhoto] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState("");

  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API.BAHAN_POKOK.INDEX);
      const processedData = response.data.map((item) => ({
        ...item,
      }));
      setData(processedData);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      Swal.fire("Error", "Gagal mengambil data bahan pokok.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      customClass: {
        popup: "bg-gray-800 text-white",
        title: "text-white",
        htmlContainer: "text-gray-300",
      },
    });

    if (result.isConfirmed) {
      try {
        const token = getAuthToken();
        if (!token) {
          Swal.fire(
            "Error",
            "Anda belum login atau sesi telah berakhir.",
            "error",
          );
          return;
        }

        await axios.delete(API.BAHAN_POKOK.DELETE(id), {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire({
          title: "Berhasil!",
          text: "Data bahan pokok telah dihapus.",
          icon: "success",
          customClass: {
            popup: "bg-gray-800 text-white",
            title: "text-white",
            htmlContainer: "text-gray-300",
          },
        });
        fetchData();
      } catch (error) {
        console.error(error);
        const errorMessage =
          error.response?.data?.message || "Gagal menghapus data bahan pokok.";
        Swal.fire("Error", errorMessage, "error");
      }
    }
  };

  const handleChange = (e) => {
  const { name, value, type } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'number' ? Number(value) : value
  }));
};

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.satuan) {
      Swal.fire("Error", "Nama dan Satuan tidak boleh kosong.", "error");
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        Swal.fire(
          "Error",
          "Anda belum login atau sesi telah berakhir.",
          "error",
        );
        return;
      }

      const submitData = new FormData();
      if (formData.urutan) submitData.append("urutan", formData.urutan);
      submitData.append("nama", formData.nama);
      submitData.append("satuan", formData.satuan);
      submitData.append("stok_wajib", formData.stok_wajib );
      submitData.append("up_stok", formData.up_stok );

      if (photoFile) {
        submitData.append("foto", photoFile);
      } else if (deletePhoto && modalType === "edit") {
        submitData.append("foto", "");
      }

      if (modalType === "edit") {
        submitData.append("_method", "PUT");
      }

      const url =
        modalType === "add"
          ? API.BAHAN_POKOK.INDEX
          : API.BAHAN_POKOK.UPDATE(formData.id);

      const method = modalType === "add" ? "post" : "post";

      await axios[method](url, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        title: "Berhasil!",
        text: `Data bahan pokok berhasil ${modalType === "add" ? "ditambahkan" : "diperbarui"}.`,
        icon: "success",
        customClass: {
          popup: "bg-gray-800 text-white",
          title: "text-white",
          htmlContainer: "text-gray-300",
        },
      });

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join("\n")
        : error.response?.data?.message || "Gagal menyimpan data bahan pokok.";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      urutan: "",
      nama: "",
      satuan: "",
      stok_wajib: "",
      up_stok: "",
    });
    setPhotoFile(null);
    setDeletePhoto(false);
    setCurrentPhoto("");
  };

  const handleAddClick = () => {
    setModalType("add");
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setModalType("edit");
    setFormData({
      id: item.id,
      urutan: item.urutan || "",
      nama: item.nama,
      satuan: item.satuan,
      stok_wajib: item.stok_wajib,
      up_stok: item.up_stok,
    });
    setCurrentPhoto(item.foto || "");
    setPhotoFile(null);
    setDeletePhoto(false);
    setShowModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

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
      <Page title="Data Bahan Pokok">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-300">Memuat data...</span>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Data Bahan Pokok">
      <div className="container mx-auto p-4 text-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-100">
            Daftar Bahan Pokok
          </h2>
          <button
            onClick={handleAddClick}
            className="transform rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700"
          >
            + Tambah Bahan Pokok
          </button>
        </div>

        {/* Show entries selector */}
        <div className="mb-4 flex items-center text-white">
          <span className="mr-2">tampilkan</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="rounded border border-gray-600 bg-gray-700 px-3 py-1 text-gray-100 focus:border-blue-500 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
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
                  Foto
                </th>
                <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                  Nama
                </th>
                <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                  Satuan
                </th>
                <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                  Stok Wajib
                </th>
                <th className="border-b border-gray-600 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                  Up Stok
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
                    <img
                      src={`http://127.0.0.1:8000${item.foto}`}
                      alt={item.nama}
                      className="h-12 w-12 rounded-lg object-cover shadow-md"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjNEI1NTYzIi8+CjxwYXRoIGQ9Ik0yNCAzMkMxOS41ODE3IDMyIDE2IDI4LjQxODMgMTYgMjRDMTYgMTkuNTgxNyAxOS41ODE3IDE2IDI0IDE2QzI4LjQxODMgMTYgMzIgMTkuNTgxNyAzMiAyNEMzMiAyOC40MTgzIDI4LjQxODMgMzIgMjQgMzJaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=";
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-300">
                    {item.nama}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {item.satuan}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.stok_wajib
                          ? "bg-green-800 text-green-200"
                          : "bg-red-800 text-red-200"
                      }`}
                    >
                      {item.stok_wajib}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.up_stok
                          ? "bg-blue-800 text-blue-200"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {item.stok_wajib}
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
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 px-10 text-red-400 transition-all duration-200 group-hover:scale-110 hover:bg-red-600/30 hover:text-red-300"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    Tidak ada data untuk ditampilkan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-white">
            menampilkan {startIndex + 1} - {Math.min(endIndex, data.length)}{" "}
            dari {data.length} data
          </div>
          <div className="flex items-center">{renderPaginationButtons()}</div>
        </div>

        {/* Enhanced Modal */}
        {showModal && (
          <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-gray-800 shadow-2xl">
              {/* Modal Header */}
              <div className="rounded-t-xl border-b border-gray-600 bg-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-100">
                    {modalType === "add"
                      ? "Tambah Bahan Pokok"
                      : "Edit Bahan Pokok"}
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
              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Urutan
                    </label>
                    <input
                      type="number"
                      name="urutan"
                      value={formData.urutan}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Urutan (opsional)"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Satuan <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="satuan"
                      value={formData.satuan}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="kg, liter, dll"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Nama Bahan Pokok <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Masukkan nama bahan pokok"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Stok Wajib <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="stok_wajib"
                      value={formData.stok_wajib}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Masukkan jumlah stok wajib"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Up Stok <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="up_stok"
                      value={formData.up_stok}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Masukkan jumlah up stok"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Foto (Opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  {modalType === "edit" && currentPhoto && (
                    <div className="mt-3">
                      <p className="mb-2 text-sm text-gray-400">
                        Foto saat ini:
                      </p>
                      <img
                        src={`http://127.0.0.1:8000${currentPhoto}`}
                        alt="Current"
                        className="h-20 w-20 rounded-lg border border-gray-600 object-cover"
                      />
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          id="delete_photo"
                          checked={deletePhoto}
                          onChange={(e) => setDeletePhoto(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                        />
                        <label
                          htmlFor="delete_photo"
                          className="ml-2 text-sm text-red-400"
                        >
                          Hapus foto lama
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 border-t border-gray-600 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg bg-gray-600 px-6 py-2 font-medium text-white transition-colors duration-150 hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
    </Page>
  );
}
