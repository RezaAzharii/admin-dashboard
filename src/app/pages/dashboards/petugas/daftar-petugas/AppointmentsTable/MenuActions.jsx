import {
  Dialog,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useState } from "react";
import axios from "axios";

import { Button, Input } from "components/ui";
import { useDisclosure } from "hooks";
import API from "configs/api.config"; // REGISTER: `${BASE_URL}/register`

export function MenuAction({ fetchUsers }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPassword, { toggle }] = useDisclosure();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    is_admin: false,
    is_petugas_pasar: true,
  });

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      is_admin: false,
      is_petugas_pasar: true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.password_confirmation) {
      alert("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(API.AUTH.REGISTER, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Petugas berhasil ditambahkan!");
      console.log("Respon:", response.data);

      
      if (fetchUsers) {
        await fetchUsers(); 
      }
      closeForm();
    } catch (error) {
      console.error("Gagal menambahkan petugas:", error.response?.data);
      alert(
        error.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tombol menu */}
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton
          as={Button}
          variant="flat"
          className="size-8 shrink-0 rounded-full p-0"
        >
          <EllipsisVerticalIcon className="size-4.5 stroke-2" />
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <MenuItems className="absolute z-50 mt-1.5 min-w-[11rem] rounded-lg border border-gray-300 bg-white py-1 shadow-md ltr:right-0 rtl:left-0 dark:border-dark-500 dark:bg-dark-700">
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={openForm}
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 text-left transition-colors",
                    focus
                      ? "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                      : "text-gray-700 dark:text-dark-200"
                  )}
                >
                  <PlusIcon className="size-4.5" />
                  <span>Tambah Petugas</span>
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>

      {/* Modal form tambah petugas */}
      <Transition appear show={isFormOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeForm}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:border-dark-500 dark:bg-dark-700">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Tambah Petugas
                  </Dialog.Title>

                  <div className="mt-4 space-y-4">
                    <Input
                      label="Nama"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan Nama"
                      className="w-full"
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Masukkan Email"
                      className="w-full"
                    />
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Masukkan Password"
                      suffix={
                        <Button
                          variant="flat"
                          className="size-6 rounded-full p-0"
                          onClick={toggle}
                        >
                          {showPassword ? (
                            <EyeIcon className="size-4 text-gray-500 dark:text-dark-200" />
                          ) : (
                            <EyeSlashIcon className="size-4 text-gray-500 dark:text-dark-200" />
                          )}
                        </Button>
                      }
                    />
                    <Input
                      label="Konfirmasi Password"
                      name="password_confirmation"
                      type={showPassword ? "text" : "password"}
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      placeholder="Ulangi Password"
                      className="w-full"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-2">
                    <Button onClick={closeForm} variant="flat">
                      Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
