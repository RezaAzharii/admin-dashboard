import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import API from "configs/api.config";
import { Page } from "components/shared/Page";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
const MySwal = withReactContent(Swal);

export default function Petugas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadTrigger, setReloadTrigger] = useState(false); // State untuk trigger reload

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    user_id: null,
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    id_pasar: "",
    no_telepon: "",
  });

  const getAuthToken = () => localStorage.getItem("authToken");

  const [daftarPasar, setDaftarPasar] = useState([]);

  // Function to fetch market data
  const fetchPasar = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        MySwal.fire("Error", "Sesi habis, login kembali.", "error");
        return;
      }
      const response = await axios.get(API.PASAR.INDEX, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDaftarPasar(response.data ?? []);
    } catch (error) {
      console.error(error);
      MySwal.fire("Error", "Gagal memuat data pasar.", "error");
    }
  };

  // Function to fetch user data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        MySwal.fire("Error", "Sesi habis, login kembali.", "error");
        return;
      }

      const response = await axios.get(API.USERS.INDEX, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Log seluruh response
      console.log("Full API response:", response);

      // Log hanya bagian data
      console.log("Data dari response:", response.data);

      // Log hanya array users (jika ada)
      const users = response.data?.data ?? [];
      console.log("Daftar user (raw):", users);

      const mappedUsers = users.map((user) => {
        const mapped = {
          user_id: user.id,
          name: user.name,
          email: user.email,
          is_petugas_pasar: user.is_petugas_pasar,
          nama_pasar: user.nama_pasar,
          id_pasar: user.id_pasar || "",
          no_telepon: user.no_telepon || "",
        };
        console.log("User yang di-mapping:", mapped);
        return mapped;
      });

      setData(mappedUsers);
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      const msg = error.response?.data?.message || "Gagal memuat data petugas.";
      MySwal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPasar();
  }, [reloadTrigger]); // Tambahkan reloadTrigger sebagai dependency

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      user_id: null,
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      id_pasar: "",
      no_telepon: "",
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setFormData({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
      id_pasar: user.id_pasar || "",
      no_telepon: user.no_telepon || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.no_telepon) {
      MySwal.fire(
        "Gagal",
        "Nama, Email, dan Nomor Telepon wajib diisi.",
        "error",
      );
      return;
    }
    if (
      !isEditMode &&
      (!formData.password ||
        formData.password !== formData.password_confirmation)
    ) {
      MySwal.fire(
        "Gagal",
        "Password kosong atau konfirmasi tidak cocok.",
        "error",
      );
      return;
    }
    if (!isEditMode && !formData.id_pasar) {
      MySwal.fire("Gagal", "Silakan pilih pasar.", "error");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^08[0-9]{8,12}$/;
    if (!phoneRegex.test(formData.no_telepon)) {
      MySwal.fire(
        "Gagal",
        "Nomor telepon harus dimulai dengan 08 dan panjang 10-15 digit.",
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        MySwal.fire("Error", "Sesi habis, login kembali.", "error");
        return;
      }

      if (isEditMode) {
        await axios.put(
          API.USERS.UPDATE(formData.user_id),
          {
            name: formData.name,
            email: formData.email,
            id_pasar: formData.id_pasar,
            no_telepon: formData.no_telepon, // Include phone number
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setData((prevData) =>
          prevData.map((user) =>
            user.user_id === formData.user_id
              ? {
                  ...user,
                  name: formData.name,
                  email: formData.email,
                  id_pasar: formData.id_pasar,
                  no_telepon: formData.no_telepon, // Update phone number
                  nama_pasar:
                    daftarPasar.find((p) => p.id === formData.id_pasar)?.nama ||
                    "-",
                }
              : user,
          ),
        );

        MySwal.fire("Sukses", "Data diperbarui.", "success");
      } else {
        const res = await axios.post(
          API.AUTH.REGISTER,
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
            is_petugas_pasar: true,
            id_pasar: formData.id_pasar,
            no_telepon: formData.no_telepon, // Include phone number
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setData((prevData) => [
          {
            user_id: res.data.user?.id || res.data.id,
            name: formData.name,
            email: formData.email,
            is_petugas_pasar: true,
            id_pasar: formData.id_pasar,
            no_telepon: formData.no_telepon, // Include phone number
            nama_pasar:
              daftarPasar.find((p) => p.id === formData.id_pasar)?.nama || "-",
          },
          ...prevData,
        ]);

        MySwal.fire("Sukses", "Petugas berhasil ditambahkan.", "success");
      }

      setShowModal(false);
      setReloadTrigger((prev) => !prev);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Terjadi kesalahan.";
      MySwal.fire("Gagal", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await MySwal.fire({
      title: "Yakin hapus data ini?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (confirm.isConfirmed) {
      try {
        const token = getAuthToken();
        if (!token) {
          MySwal.fire("Error", "Sesi habis, login kembali.", "error");
          return;
        }
        await axios.delete(API.USERS.DELETE(id), {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Optimalkan penghapusan data dengan functional update
        setData((prevData) => prevData.filter((user) => user.user_id !== id));
        setReloadTrigger((prev) => !prev); // Trigger reload setelah penghapusan
        MySwal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || "Gagal menghapus data.";
        MySwal.fire("Gagal", msg, "error");
      }
    }
  };

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(data.length / entriesPerPage),
    [data.length, entriesPerPage],
  );
  const currentEntries = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return data.slice(start, start + entriesPerPage);
  }, [data, currentPage, entriesPerPage]);

  return (
    <Page title="Petugas">
      <div className="min-h-screen w-full  px-6 pt-5 ">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Daftar Petugas
          </h2>
          <button
            onClick={openAddModal}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Tambah Data
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Memuat data petugas...
          </p>
        ) : (
          <>
            <div className="mb-4 flex items-center space-x-2 text-gray-900 dark:text-white">
              <span>Tampilkan</span>
              <select
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
              </select>
              <span>data per halaman</span>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="min-w-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="rounded-tl-lg border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-white">
                      #
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-white">
                      Nama
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-white">
                      Nama Pasar
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-white">
                      Email
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-white">
                      No Telepon
                    </th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-white">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {currentEntries.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada data petugas.
                      </td>
                    </tr>
                  ) : (
                    currentEntries.map((user, i) => (
                      <tr
                        key={user.user_id}
                        className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          {(currentPage - 1) * entriesPerPage + i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          {user.nama_pasar || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          {user.no_telepon}
                        </td>
                        <td className="flex items-center space-x-2 px-4 py-3">
                          <button
                            onClick={() => openEditModal(user)}
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-yellow-100 px-4 text-yellow-800 transition-all duration-200 hover:bg-yellow-200 dark:bg-yellow-600/20 dark:text-yellow-400 dark:hover:bg-yellow-600/30 dark:hover:text-yellow-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.user_id)}
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-red-100 px-4 text-red-800 transition-all duration-200 hover:bg-red-200 dark:bg-red-600/20 dark:text-red-400 dark:hover:bg-red-600/30 dark:hover:text-red-300"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between px-2 text-gray-900 dark:text-white">
              <div>
                Menampilkan{" "}
                {Math.min((currentPage - 1) * entriesPerPage + 1, data.length)}{" "}
                - {Math.min(currentPage * entriesPerPage, data.length)} dari{" "}
                {data.length} data
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  <ChevronLeftIcon className="h-[12px]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-md px-3 py-1 transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  <ChevronRightIcon className="h-[12px]" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            {/* Modal Header */}
            <div className="rounded-t-xl border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isEditMode ? "Edit Petugas" : "Tambah Petugas Baru"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 transition-colors duration-150 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
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
            <div className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nama <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Masukkan nama petugas"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Masukkan email petugas"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nomor Telepon{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="no_telepon"
                  value={formData.no_telepon}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Masukkan nomor telepon (contoh: 081234567890)"
                  required
                  pattern="^08[0-9]{8,12}$"
                  title="Nomor harus dimulai dengan 08 dan panjang 10-15 digit"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nama Pasar
                </label>
                <select
                  name="id_pasar"
                  value={formData.id_pasar}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">-- Pilih Pasar --</option>
                  {daftarPasar.map((pasar) => (
                    <option key={pasar.id} value={pasar.id}>
                      {pasar.nama}
                    </option>
                  ))}
                </select>
              </div>

              {!isEditMode && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Password{" "}
                      <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Masukkan password"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Konfirmasi Password{" "}
                      <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Konfirmasi password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors duration-150 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {isEditMode ? "Simpan Perubahan" : "Tambah Petugas"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
