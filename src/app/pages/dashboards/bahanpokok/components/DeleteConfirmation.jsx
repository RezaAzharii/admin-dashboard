import Swal from "sweetalert2";

const DeleteConfirmation = ({ showModal, setShowModal, onConfirm, itemName }) => {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Data "${itemName}" yang dihapus tidak dapat dikembalikan!`,
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
      onConfirm();
    } else {
      setShowModal(false);
    }
  };

  if (!showModal) return null;

  return handleDelete();
};

export default DeleteConfirmation;