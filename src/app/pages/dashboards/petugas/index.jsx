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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    user_id: null,
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const getAuthToken = () => localStorage.getItem("authToken");

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

      const users = response.data?.data ?? [];
      const mappedUsers = users.map((user) => ({
        user_id: user.id,
        name: user.name,
        email: user.email,
        is_petugas_pasar: user.is_petugas_pasar,
      }));

      setData(mappedUsers);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal memuat data petugas.";
      MySwal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      user_id: null,
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
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
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      MySwal.fire("Gagal", "Nama dan Email wajib diisi.", "error");
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
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setData((prev) =>
          prev.map((user) =>
            user.user_id === formData.user_id
              ? { ...user, name: formData.name, email: formData.email }
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
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const newUser = res.data.user || {
          user_id: res.data.id,
          name: formData.name,
          email: formData.email,
          is_petugas_pasar: true,
        };
        setData((prev) => [...prev, newUser]);
        setCurrentPage(1);
        MySwal.fire("Sukses", "Petugas berhasil ditambahkan.", "success");
      }

      setShowModal(false);
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
        setData((prev) => prev.filter((user) => user.user_id !== id));
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
      <div className="w-full px-6 pt-5">
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
          <p className="text-center text-white">Memuat data petugas...</p>
        ) : (
          <>
            <div className="mb-4 flex items-center space-x-2 text-white">
              <span>Tampilkan</span>
              <select
                className="rounded-md border border-gray-600 bg-gray-700 px-2 py-1"
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
              <table className="min-w-full border border-gray-700 bg-gray-900">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="rounded-tl-lg px-4 py-3 text-left text-sm font-semibold tracking-wider text-white uppercase">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold tracking-wider text-white uppercase">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold tracking-wider text-white uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold tracking-wider text-white uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-8 text-center text-gray-500"
                      >
                        Tidak ada data petugas.
                      </td>
                    </tr>
                  ) : (
                    currentEntries.map((user, i) => (
                      <tr
                        key={user.user_id}
                        className="border-t border-gray-700 transition-colors duration-150 hover:bg-gray-800"
                      >
                        <td className="px-4 py-3 text-white">
                          {(currentPage - 1) * entriesPerPage + i + 1}
                        </td>
                        <td className="px-4 py-3 text-white">{user.name}</td>
                        <td className="px-4 py-3 text-white">{user.email}</td>
                        <td className="flex items-center space-x-2 px-4 py-3">
                          <button
                            onClick={() => openEditModal(user)}
                            className="inline-flex px-10 h-8 w-8 items-center justify-center rounded-lg bg-yellow-600/20 text-yellow-400 transition-all duration-200 group-hover:scale-110 hover:bg-yellow-600/30 hover:text-yellow-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.user_id)}
                            className="inline-flex px-10 h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 text-red-400 transition-all duration-200 group-hover:scale-110 hover:bg-red-600/30 hover:text-red-300"
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

            <div className="mt-4 flex items-center justify-between px-2 text-white">
              <div>
                Menampilkan{" "}
                {Math.min((currentPage - 1) * entriesPerPage + 1, data.length)}{" "}
                - {Math.min(currentPage * entriesPerPage, data.length)}{" "}
                dari {data.length} data
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-md bg-gray-700 px-3 py-1 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-[12px]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-md px-3 py-1 ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-md bg-gray-700 px-3 py-1 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-gray-800 shadow-2xl">
            {/* Modal Header */}
            <div className="rounded-t-xl border-b border-gray-600 bg-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-100">
                  {isEditMode ? "Edit Petugas" : "Tambah Petugas Baru"}
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
            <div className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Nama <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Masukkan nama petugas"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Masukkan email petugas"
                  required
                />
              </div>

              {!isEditMode && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Masukkan password"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Konfirmasi Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Konfirmasi password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 border-t border-gray-600 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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