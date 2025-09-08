  
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import axios from "axios";
import API from "configs/api.config";

const HargaBapokTableBody = ({ data, onEditClick, currentUser }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("authToken");
      const selectedItem = data.find((item) => item.id === id);
      const payload = { ...selectedItem, status_integrasi: "approve" };
      await axios.put(API.HARGA_BAPOK.UPDATE(id), payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      Swal.fire("Berhasil!", "Data telah disetujui.", "success");
      queryClient.invalidateQueries({ queryKey: ["hargaBapok"] });
    },
    onError: (err) => {
      Swal.fire("Gagal!", `Terjadi kesalahan: ${err.message}`, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("authToken");
      await axios.delete(API.HARGA_BAPOK.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      Swal.fire("Dihapus!", "Data berhasil dihapus.", "success");
      queryClient.invalidateQueries({ queryKey: ["hargaBapok"] });
    },
    onError: (err) => {
      Swal.fire("Gagal!", `Gagal menghapus data: ${err.message}`, "error");
    },
  });

  const handleApproveClick = (id) => {
    Swal.fire({
      title: "Setujui Data?",
      text: "Apakah Anda yakin ingin menyetujui data ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Setujui",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        approveMutation.mutate(id);
      }
    });
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  
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
    
    
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mx-1 rounded border border-gray-600 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-900"
      >
        ‹
      </button>,
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 rounded border px-3 py-2 text-sm font-medium ${
            currentPage === i
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-600 bg-gray-50 text-gray-900 hover:bg-gray-600 dark:bg-dark-900 dark:text-gray-100"
          }`}
        >
          {i}
        </button>,
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="mx-1 rounded border border-gray-600 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-900 dark:text-gray-100"
      >
        ›
      </button>,
    );

    return buttons;
  };


  return (
    <>
      <div className="dark:text-dark-50 mb-4 flex items-center text-gray-800">
        <span className="mr-2">Tampilkan</span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="dark:text-dark-50 rounded border border-gray-600 bg-gray-50 px-3 py-1 text-gray-800 focus:border-blue-500 focus:outline-none dark:bg-dark-900"
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
      <div className="overflow-x-auto rounded-lg bg-white shadow-xl dark:bg-dark-900">
        <table className="min-w-full border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-900">
            <tr>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">#</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">dibuat oleh</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">Pasar</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">Bahan Pokok</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">Tanggal</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">Harga</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">% Perubahan</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">Stok</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">Status</th>
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-dark-900">
            {currentData.map((item, index) => (
              <tr key={item.id} className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{startIndex + index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.created_by || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.pasar ? item.pasar.nama : "N/A"}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.bahan_pokok ? item.bahan_pokok.nama : "N/A"}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">Rp {parseFloat(item.harga).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 text-sm">
                  {item.change_status === "up" && (<span className="text-red-600 dark:text-red-400">▲ {item.change_percent}%</span>)}
                  {item.change_status === "down" && (<span className="text-green-600 dark:text-green-400">▼ {item.change_percent}%</span>)}
                  {item.change_status === "same" && (<span className="text-gray-600 dark:text-gray-300">{item.change_percent}%</span>)}
                  {item.change_status === "N/A" && "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.stok} {item.bahan_pokok ? item.bahan_pokok.satuan : ""}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    item.status_integrasi === "approve" ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                    : item.status_integrasi === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                    : "bg-gray-100 text-gray-800 dark:bg-dark-900 dark:text-gray-300"
                  }`}>
                    {item.status_integrasi === "approve" ? "Disetujui" : item.status_integrasi === "pending" ? "Pending" : item.status_integrasi}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    {item.status_integrasi === "pending" && !currentUser?.is_petugas_pasar && (
                      <button onClick={() => handleApproveClick(item.id)} className="inline-flex h-8 items-center justify-center rounded-lg bg-green-100 px-3 text-green-800 transition-all duration-200 hover:bg-green-200 dark:bg-green-600/20 dark:text-green-400 dark:hover:bg-green-600/30 dark:hover:text-green-300">Setujui</button>
                    )}
                    <button onClick={() => onEditClick(item)} className="inline-flex h-8 items-center justify-center rounded-lg bg-yellow-100 px-3 text-yellow-800 transition-all duration-200 hover:bg-yellow-200 dark:bg-yellow-600/20 dark:text-yellow-300 dark:hover:bg-yellow-600/30 dark:hover:text-yellow-300">Edit</button>
                    <button onClick={() => handleDeleteClick(item.id)} className="inline-flex h-8 items-center justify-center rounded-lg bg-red-100 px-3 text-red-800 transition-all duration-200 hover:bg-red-200 dark:bg-red-600/20 dark:text-red-300 dark:hover:bg-red-600/30 dark:hover:text-red-300">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-white">Menampilkan {startIndex + 1} - {Math.min(endIndex, data.length)} dari {data.length} data</div>
        <div className="flex items-center">{renderPaginationButtons()}</div>
      </div>
    </>
  );
};

export default HargaBapokTableBody;