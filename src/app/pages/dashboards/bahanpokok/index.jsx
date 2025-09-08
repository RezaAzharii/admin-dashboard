import { useState } from "react";
import { Page } from "components/shared/Page";
import { useBahanPokok, useDeleteBahanPokok } from "./components/useBahanPokok";
import BahanPokokTable from "./components/BahanPokokTable";
import BahanPokokModal from "./components/BahanPokokModal";
import DeleteConfirmation from "./components/DeleteConfirmation";
import Pagination from "./components/Pagination";
import { useContext } from "react";
import AuthContext from "app/contexts/auth/authContext";

export default function BahanPokok() {
  const { user: currentUser } = useContext(AuthContext);
  const { data: bahanPokokData = [], isLoading } = useBahanPokok();
  const deleteMutation = useDeleteBahanPokok();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    urutan: "",
    nama: "",
    satuan: "",
    stok_wajib: "",
    up_stok: "",
  });

    
  const totalPages = Math.ceil(bahanPokokData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = bahanPokokData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleAddClick = () => {
    setModalType("add");
    setFormData({
      id: null,
      urutan: "",
      nama: "",
      satuan: "",
      stok_wajib: "",
      up_stok: "",
    });
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
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedItem(bahanPokokData.find(item => item.id === id));
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      deleteMutation.mutate(selectedItem.id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-300">Memuat data...</span>
      </div>
    );
  }

  return (
    <Page title="Data Bahan Pokok">
      <div className="container mx-auto p-4 text-gray-900 dark:text-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Daftar Bahan Pokok
          </h2>
          {!currentUser?.is_petugas_pasar && (
            <button
              onClick={handleAddClick}
              className="transform rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700"
            >
              + Tambah Bahan Pokok
            </button>
          )}
        </div>

        <div className="mb-4 flex items-center text-gray-900 dark:text-white">
          <span className="mr-2">tampilkan</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-900 dark:text-gray-100"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2">data per halaman</span>
        </div>

        <BahanPokokTable
          data={currentData}
          startIndex={startIndex}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          currentUser={currentUser}
        />

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-900 dark:text-white">
            menampilkan {startIndex + 1} - {Math.min(endIndex, bahanPokokData.length)}{" "}
            dari {bahanPokokData.length} data
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {showModal && (
          <BahanPokokModal
            showModal={showModal}
            setShowModal={setShowModal}
            modalType={modalType}
            formData={formData}
            setFormData={setFormData}
            selectedItem={selectedItem}
          />
        )}

        {showDeleteModal && (
          <DeleteConfirmation
            showModal={showDeleteModal}
            setShowModal={setShowDeleteModal}
            onConfirm={confirmDelete}
            itemName={selectedItem?.nama || "item ini"}
          />
        )}
      </div>
    </Page>
  );
}