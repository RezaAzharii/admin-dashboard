  
import { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AuthContext from "app/contexts/auth/authContext";
import API from "configs/api.config";


import TableFilters from "./TableFilters";
import HargaBapokTableBody from "./HargaBapokTableBody";
import HargaBapokModal from "./HargaBapokModal";

const fetchHargaBapokData = async ({ queryKey }) => {
  const [, selectedDate, currentUser] = queryKey;
  const token = localStorage.getItem("authToken");

  let url = API.HARGA_BAPOK.INDEX;
  const params = { tanggal: selectedDate };

  if (currentUser?.is_petugas_pasar && currentUser.id_pasar) {
    params.id_pasar = currentUser.id_pasar;
  }

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  return response.data;
};

const fetchDependencies = async () => {
  const token = localStorage.getItem("authToken");
  const headers = { Authorization: `Bearer ${token}` };

  const [pasarResponse, bahanPokokResponse] = await Promise.all([
    axios.get(API.PASAR.INDEX, { headers }),
    axios.get(API.BAHAN_POKOK.INDEX, { headers }),
  ]);

  return {
    listPasar: pasarResponse.data,
    listBahanPokok: bahanPokokResponse.data,
  };
};

export default function HargaBapokTable() {
  const { user: currentUser } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    })
  );
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [formData, setFormData] = useState({
    id: null,
    id_pasar: "",
    id_bahan_pokok: "",
    tanggal: "",
    harga: "",
    stok: "",
    status_integrasi: "pending",
  });

  
  const {
    data: dataHarga,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hargaBapok", selectedDate, currentUser],
    queryFn: fetchHargaBapokData,
    enabled: !!currentUser, 
  });

  
  const { data: dependencies, isLoading: isDependenciesLoading } = useQuery({
    queryKey: ["dependencies"],
    queryFn: fetchDependencies,
    staleTime: Infinity, 
  });

  const handleAddClick = () => {
    setModalType("add");
    setFormData({
      id: null,
      id_pasar: currentUser?.is_petugas_pasar
        ? String(currentUser.id_pasar)
        : "",
      id_bahan_pokok: "",
      tanggal: selectedDate,
      harga: "",
      stok: "",
      status_integrasi: "pending",
    });
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setModalType("edit");
    setFormData({
      id: item.id,
      id_pasar: String(item.id_pasar),
      id_bahan_pokok: String(item.id_bahan_pokok),
      tanggal: new Date(item.tanggal).toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
      }),
      harga: item.harga.toString(),
      stok: item.stok.toString(),
      status_integrasi: item.status_integrasi,
    });
    setShowModal(true);
  };

  const handleAfterMutate = () => {
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
    refetch(); 
  };

  if (isLoading || isDependenciesLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-3">Memuat data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-4 text-center text-red-400">
        Gagal mengambil data: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-gray-100">
      <TableFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onAddClick={handleAddClick}
      />
      
      <HargaBapokTableBody
        data={dataHarga}
        onEditClick={handleEditClick}
        refetch={refetch}
        currentUser={currentUser}
      />

      <HargaBapokModal
        showModal={showModal}
        modalType={modalType}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setShowModal(false)}
        listPasar={dependencies?.listPasar || []}
        listBahanPokok={dependencies?.listBahanPokok || []}
        onSuccess={handleAfterMutate}
        currentUser={currentUser}
      />
    </div>
  );
}