import { useState } from "react";
import { useCreateBahanPokok, useUpdateBahanPokok } from "./useBahanPokok";
import Swal from "sweetalert2";

const BahanPokokModal = ({ 
  showModal, 
  setShowModal, 
  modalType, 
  formData, 
  setFormData,
  selectedItem
}) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [deletePhoto, setDeletePhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const createMutation = useCreateBahanPokok();
  const updateMutation = useUpdateBahanPokok();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
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
      const submitData = {
        ...formData,
        photoFile,
        deletePhoto: modalType === "edit" ? deletePhoto : false
      };

      if (modalType === "add") {
        await createMutation.mutateAsync(submitData);
      } else {
        await updateMutation.mutateAsync({ id: formData.id, formData: submitData });
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
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
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-dark-900">
        <div className="rounded-t-xl border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-dark-900">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {modalType === "add" ? "Tambah Bahan Pokok" : "Edit Bahan Pokok"}
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

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nama Bahan Pokok <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"
              placeholder="Masukkan nama bahan pokok"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Stok Wajib <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="number"
                name="stok_wajib"
                value={formData.stok_wajib}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"
                placeholder="Masukkan jumlah stok wajib"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Up Stok <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="number"
                name="up_stok"
                value={formData.up_stok}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"
                placeholder="Masukkan jumlah up stok"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Urutan
              </label>
              <input
                type="number"
                name="urutan"
                value={formData.urutan}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"
                placeholder="Urutan (opsional)"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Satuan <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                name="satuan"
                value={formData.satuan}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"
                placeholder="kg, liter, dll"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Foto (Opsional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-all duration-150 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"
            />

            {modalType === "edit" && selectedItem?.foto && (
              <div className="mt-3">
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  Foto saat ini:
                </p>
                <img
                  src={`http://127.0.0.1:8000${selectedItem.foto}`}
                  alt="Current"
                  className="h-20 w-20 rounded-lg border border-gray-300 object-cover dark:border-gray-600"
                />
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="delete_photo"
                    checked={deletePhoto}
                    onChange={(e) => setDeletePhoto(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-white text-red-600 focus:ring-red-500 dark:border-gray-600 dark:bg-dark-900"
                  />
                  <label
                    htmlFor="delete_photo"
                    className="ml-2 text-sm text-red-600 dark:text-red-400"
                  >
                    Hapus foto lama
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-800 transition-colors duration-150 hover:bg-gray-300 dark:bg-dark-900 dark:text-white dark:hover:bg-gray-700"
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
  );
};

export default BahanPokokModal;