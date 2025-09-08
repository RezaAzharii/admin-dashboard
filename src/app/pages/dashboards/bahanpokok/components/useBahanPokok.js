import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import API from "configs/api.config";
import Swal from "sweetalert2";
import { triggerDataUpdate } from "app/services/utils/dashboardEvents"; 

const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const useBahanPokok = () => {
  return useQuery({
    queryKey: ["bahanPokok"],
    queryFn: async () => {
      const response = await axios.get(API.BAHAN_POKOK.INDEX);
      return response.data;
    },
  });
};

export const useCreateBahanPokok = () => {
  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: async (formData) => {

      const token = getAuthToken();

      const submitData = new FormData();

      if (formData.urutan) submitData.append("urutan", formData.urutan);
      submitData.append("nama", formData.nama);
      submitData.append("satuan", formData.satuan);
      submitData.append("stok_wajib", formData.stok_wajib);
      submitData.append("up_stok", formData.up_stok);

      if (formData.photoFile) {
        submitData.append("foto", formData.photoFile);
      }

      const response = await axios.post(API.BAHAN_POKOK.INDEX, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bahanPokok"]);
      triggerDataUpdate();   
      Swal.fire({
        title: "Berhasil!",
        text: "Data bahan pokok berhasil ditambahkan.",
        icon: "success",
        customClass: {
          popup: "bg-gray-800 text-white",
          title: "text-white",
          htmlContainer: "text-gray-300",
        },
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join("\n")
        : error.response?.data?.message || "Gagal menyimpan data bahan pokok.";
      Swal.fire("Error", errorMessage, "error");
    },
  });
};

export const useUpdateBahanPokok = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const token = getAuthToken();
      const submitData = new FormData();
      
      if (formData.urutan) submitData.append("urutan", formData.urutan);
      submitData.append("nama", formData.nama);
      submitData.append("satuan", formData.satuan);
      submitData.append("stok_wajib", formData.stok_wajib);
      submitData.append("up_stok", formData.up_stok);
      submitData.append("_method", "PUT");
      
      if (formData.photoFile) {
        submitData.append("foto", formData.photoFile);
      } else if (formData.deletePhoto) {
        submitData.append("foto", "");
      }

      const response = await axios.post(API.BAHAN_POKOK.UPDATE(id), submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bahanPokok"]);
      triggerDataUpdate();   
      Swal.fire({
        title: "Berhasil!",
        text: "Data bahan pokok berhasil diperbarui.",
        icon: "success",
        customClass: {
          popup: "bg-gray-800 text-white",
          title: "text-white",
          htmlContainer: "text-gray-300",
        },
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join("\n")
        : error.response?.data?.message || "Gagal memperbarui data bahan pokok.";
      Swal.fire("Error", errorMessage, "error");
    },
  });
};

export const useDeleteBahanPokok = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const token = getAuthToken();
      const response = await axios.delete(API.BAHAN_POKOK.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bahanPokok"]);
      triggerDataUpdate();   
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
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus data bahan pokok.";
      Swal.fire("Error", errorMessage, "error");
    },
  });
};