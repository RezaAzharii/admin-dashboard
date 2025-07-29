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

  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        MySwal.fire(
          "Error",
          "Anda belum login atau sesi telah berakhir. Silakan login kembali.",
          "error",
        );
        setLoading(false);
        return;
      }

      // Mengambil semua user, tanpa paginasi di frontend, asumsi backend akan mengirim semua data
      // Jika backend sudah menerapkan paginasi, Anda perlu menyesuaikan ini seperti saran sebelumnya (Opsi 2)
      const response = await axios.get(API.USERS.INDEX, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const users = response.data?.data ?? [];
      const mappedUsers = users.map((user) => ({
        user_id: user.id,
        name: user.name,
        email: user.email,
        // Tambahkan properti lain yang relevan jika ada di respons, misal: is_admin, is_petugas_pasar
        is_admin: user.is_admin,
        is_petugas_pasar: user.is_petugas_pasar,
      }));

      setData(mappedUsers);
      setCurrentPage(1); // Reset to first page on new data fetch
    } catch (error) {
      console.error("Gagal memuat data user:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal memuat data petugas.";
      MySwal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    MySwal.fire({
      title: "Yakin hapus data ini?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = getAuthToken();
          if (!token) {
            MySwal.fire(
              "Error",
              "Anda belum login atau sesi telah berakhir. Silakan login kembali.",
              "error",
            );
            return;
          }

          await axios.delete(API.USERS.DELETE(id), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Optimistically update the UI
          setData((old) => old.filter((user) => user.id !== id));
          MySwal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        } catch (err) {
          console.error("Gagal menghapus:", err);
          const errorMessage =
            err.response?.data?.message || "Gagal menghapus user.";
          MySwal.fire("Gagal", errorMessage, "error");
        }
      }
    });
  };

  const handleEdit = async (user) => {
    const result = await MySwal.fire({
      title: "Edit User",
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Nama" value="${user.name || ""}" required />
        <input id="swal-email" class="swal2-input" placeholder="Email" value="${user.email || ""}" type="email" required />
        <label class="swal2-checkbox" style="display: flex; align-items: center; justify-content: center; margin-top: 10px;">
        </label>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan Perubahan",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const name = document.getElementById("swal-name").value;
        const email = document.getElementById("swal-email").value;

        if (!name || !email) {
          MySwal.showValidationMessage("Nama dan Email tidak boleh kosong.");
          return false;
        }
        return { name, email }; // Sertakan is_petugas_pasar
      },
    });

    if (result.isConfirmed && result.value) {
      try {
        const token = getAuthToken();
        if (!token) {
          MySwal.fire(
            "Error",
            "Anda belum login atau sesi telah berakhir. Silakan login kembali.",
            "error",
          );
          return;
        }

        await axios.put(API.USERS.UPDATE(user.user_id), result.value, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Optimistically update the edited user in the data array
        setData((prevData) =>
          prevData.map((item) =>
            item.user_id === user.user_id ? { ...item, ...result.value } : item,
          ),
        );

        MySwal.fire("Tersimpan!", "Data berhasil diperbarui.", "success");
      } catch (err) {
        console.error("Gagal update:", err);
        const errorMessage =
          err.response?.data?.message || "Gagal memperbarui user.";
        MySwal.fire("Gagal", errorMessage, "error");
      }
    }
  };

  const handleAdd = async () => {
    const result = await MySwal.fire({
      title: "Tambah Petugas Baru",
      html: `
        <input id="swal-add-name" class="swal2-input" placeholder="Nama" required />
        <input id="swal-add-email" class="swal2-input" placeholder="Email" type="email" required />
        <input id="swal-add-password" class="swal2-input" placeholder="Password" type="password" required />
        <input id="swal-add-password-confirm" class="swal2-input" placeholder="Konfirmasi Password" type="password" required />
        <input type="hidden" id="swal-add-is-petugas-pasar" value="true" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Daftar",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const name = document.getElementById("swal-add-name").value;
        const email = document.getElementById("swal-add-email").value;
        const password = document.getElementById("swal-add-password").value;
        const password_confirmation = document.getElementById(
          "swal-add-password-confirm",
        ).value;
        // const is_admin = document.getElementById("swal-add-is-admin")?.checked || false; // Ambil nilai is_admin jika ada
        const is_petugas_pasar = true; // Ini yang Anda inginkan: selalu true

        if (!name || !email || !password || !password_confirmation) {
          MySwal.showValidationMessage("Semua field wajib diisi.");
          return false;
        }
        if (password !== password_confirmation) {
          MySwal.showValidationMessage(
            "Password dan konfirmasi password tidak cocok.",
          );
          return false;
        }
        return {
          name,
          email,
          password,
          password_confirmation,
          is_petugas_pasar /*, is_admin */,
        }; // Sertakan is_petugas_pasar
      },
    });

    if (result.isConfirmed && result.value) {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          MySwal.fire(
            "Error",
            "Anda belum login atau sesi telah berakhir. Silakan login kembali.",
            "error",
          );
          setLoading(false);
          return;
        }

        console.log("Mengirim data:", result.value); // Untuk debugging: lihat data yang dikirim

        const response = await axios.post(API.AUTH.REGISTER, result.value, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        MySwal.fire("Berhasil!", "Petugas berhasil ditambahkan.", "success");

        const newUser = response.data.user || {
          user_id: response.data.id, // Assuming the backend returns the ID
          name: result.value.name,
          email: result.value.email,
          is_petugas_pasar: true, // Pastikan is_petugas_pasar diset di sini untuk UI optimistik
          // is_admin: result.value.is_admin, // Jika Anda menambahkan is_admin
        };

        setData((prevData) => [...prevData, newUser]);
        setCurrentPage(1);
      } catch (error) {
        console.error("Gagal menambahkan petugas:", error.response?.data);
        const errorMessage = error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join("\n")
          : error.response?.data?.message ||
            "Terjadi kesalahan saat menyimpan data.";
        MySwal.fire("Gagal", errorMessage, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Pagination Logic ---
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / entriesPerPage);
  }, [data.length, entriesPerPage]);

  const currentEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, entriesPerPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when entries per page changes
  };
  // --- End Pagination Logic ---

  useEffect(() => {
    fetchUsers();
  }, []); // Jika Anda tidak menggunakan paginasi server-side, array dependensi ini sudah benar.
  // Jika Anda menggunakan paginasi server-side, Anda mungkin perlu menyertakan currentPage dan entriesPerPage di sini.

  return (
  <Page title="Petugas">
    <div className="transition-content w-full px-6 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Daftar Petugas
        </h2>
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:bg-blue-700"
          onClick={handleAdd}
        >
          + Tambah Data
        </button>
      </div>

      {loading ? (
        <p className="py-4 text-center text-white">Memuat data petugas...</p>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <span>Tampilkan</span>
              <select
                className="rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={entriesPerPage}
                onChange={handleEntriesChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>data per halaman</span>
            </div>
            {/* Optional: Tambahkan pencarian jika perlu */}
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
                          className="inline-flex px-10 h-8 w-8 items-center justify-center rounded-lg bg-yellow-600/20 text-yellow-400 transition-all duration-200 group-hover:scale-110 hover:bg-yellow-600/30 hover:text-yellow-300"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="inline-flex px-10 h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 text-red-400 transition-all duration-200 group-hover:scale-110 hover:bg-red-600/30 hover:text-red-300"
                          onClick={() => handleDelete(user.id)}
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

          {/* Kontrol Paginasi */}
          <div className="mt-4 flex items-center justify-between px-2 text-white">
            <div>
              Menampilkan{" "}
              {Math.min((currentPage - 1) * entriesPerPage + 1, data.length)}{" "}
               - {Math.min(currentPage * entriesPerPage, data.length)}{" "}
              dari {data.length} data
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md bg-gray-700 px-3 py-1 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-[12px]" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`rounded-md px-3 py-1 ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md bg-gray-700 px-3 py-3 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRightIcon className="h-[12px]" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  </Page>
);

}
