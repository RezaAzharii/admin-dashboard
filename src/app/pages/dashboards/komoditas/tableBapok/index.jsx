import { useState, useEffect } from "react";
import axios from "axios";
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

  useEffect(() => {
    fetchDataHarga();
  }, []);

  const fetchDataHarga = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API.HARGA_BAPOK.INDEX);
      setDataHarga(response.data);
    } catch (err) {
      setError("Gagal mengambil data harga bahan pokok.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        await axios.post(API.HARGA_BAPOK.STORE, formData);
      } else {
        await axios.put(API.HARGA_BAPOK.UPDATE(formData.id), formData);
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
      fetchDataHarga(); // Refresh data
    } catch (err) {
      alert("Gagal menyimpan data.");
      console.error("Error saving data:", err);
    }
  };

  const handleAddClick = () => {
    setModalType("add");
    setFormData({
      id: null,
      id_pasar: "",
      id_bahan_pokok: "",
      tanggal: "",
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
      tanggal: item.tanggal.split("T")[0], // Format tanggal untuk input type="date"
      harga: item.harga,
      stok: item.stok,
      status_integrasi: item.status_integrasi,
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await axios.delete(API.HARGA_BAPOK.DELETE(id));
        fetchDataHarga(); // Refresh data
      } catch (err) {
        alert("Gagal menghapus data.");
        console.error("Error deleting data:", err);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-300">Memuat data...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-400">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 text-gray-100"> {/* Menambahkan text-gray-100 untuk teks umum */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-100">Daftar Harga Bahan Pokok</h2> {/* Warna teks header */}
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" // Warna tombol tambah data
        >
          Tambah Data
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 border border-gray-700 shadow-md rounded-lg"> {/* Latar belakang tabel lebih gelap */}
          <thead className="bg-gray-700"> {/* Latar belakang header tabel */}
            <tr>
              <th className="py-2 px-4 border-b border-gray-600 text-gray-200">ID</th>
              <th className="py-2 px-4 border-b border-gray-600 text-gray-200">Pasar</th>
              <th className="py-2 px-4 border-b border-gray-600 text-gray-200">Bahan Pokok</th>
              <th className="py-2 px-4 border-b border-gray-600 text-gray-200">Tanggal</th>
              <th className="py-2 px-4 border-b border-gray-600 text-gray-200">Harga</th>
              <th className="py-2 px-4 border-b border-gray-600 text-gray-200">Stok</th>
              <th className="py-2 px-4 border-b border-gray-600 text-gray-200">Status Integrasi</th>
              <th className="py-2 px-4 border-b border-gray-600 text-gray-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dataHarga.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700"> {/* Warna hover lebih gelap */}
                <td className="py-2 px-4 border-b border-gray-700">{item.id}</td>
                <td className="py-2 px-4 border-b border-gray-700">{item.pasar.nama}</td>
                <td className="py-2 px-4 border-b border-gray-700">{item.bahan_pokok.nama}</td>
                <td className="py-2 px-4 border-b border-gray-700">
                  {new Date(item.tanggal).toLocaleDateString("id-ID")}
                </td>
                <td className="py-2 px-4 border-b border-gray-700">Rp {parseFloat(item.harga).toLocaleString("id-ID")}</td>
                <td className="py-2 px-4 border-b border-gray-700">{item.stok} {item.bahan_pokok.satuan}</td>
                <td className="py-2 px-4 border-b border-gray-700">{item.status_integrasi}</td>
                <td className="py-2 px-4 border-b border-gray-700 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm" // Warna edit tetap kuning
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm" // Warna delete sedikit lebih gelap
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"> {/* Overlay lebih gelap */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-gray-100"> {/* Latar belakang modal gelap, teks terang */}
            <h3 className="text-xl font-bold mb-4">
              {modalType === "add" ? "Tambah Data Harga" : "Edit Data Harga"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2"> {/* Warna label */}
                  ID Pasar:
                </label>
                <input
                  type="number"
                  name="id_pasar"
                  value={formData.id_pasar}
                  onChange={handleChange}
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline" // Input gelap
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  ID Bahan Pokok:
                </label>
                <input
                  type="number"
                  name="id_bahan_pokok"
                  value={formData.id_bahan_pokok}
                  onChange={handleChange}
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Tanggal:
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Harga:
                </label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleChange}
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Stok:
                </label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleChange}
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Status Integrasi:
                </label>
                <select
                  name="status_integrasi"
                  value={formData.status_integrasi}
                  onChange={handleChange}
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" // Warna tombol batal
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" // Warna tombol simpan
                >
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