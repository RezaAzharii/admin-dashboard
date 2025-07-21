// Import Dependencies
import {
  Dialog,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { CiViewTable } from "react-icons/ci";

// Local Imports
import { Button, Input } from "components/ui";
import { useDisclosure } from "hooks";
// ----------------------------------------------------------------------

export function MenuAction() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [show, { toggle }] = useDisclosure();

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  return (
    <>
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
          <MenuItems className="shadow-soft dark:border-dark-500 dark:bg-dark-700 absolute z-100 mt-1.5 min-w-[11rem] rounded-lg border border-gray-300 bg-white py-1 shadow-gray-200/50 outline-hidden focus-visible:outline-hidden ltr:right-0 rtl:left-0 dark:shadow-none">
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={openForm}
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                >
                  <PlusIcon className="size-4.5" />
                  <span>Tambah Petugas</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                >
                  <ArrowUpTrayIcon className="size-4.5" />
                  <span>Export CVS</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                >
                  <ArrowUpTrayIcon className="size-4.5" />
                  <span>Export PDF</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                >
                  <CiViewTable className="size-4.5" />
                  <span>Save as view</span>
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Tambah Petugas
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    <Input
                      label="Nama"
                      type="text"
                      placeholder="Masukan Nama"
                      className="w-full rounded-md border border-gray-300 px-4 py-2"
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Masukan Email"
                      className="w-full rounded-md border border-gray-300 px-4 py-2"
                    />
                    <Input
                      label="Password"
                      type={show ? "text" : "password"}
                      placeholder="Masukan Password"
                      suffix={
                        <Button
                          variant="flat"
                          className="pointer-events-auto size-6 shrink-0 rounded-full p-0"
                          onClick={toggle}
                        >
                          {show ? (
                            <EyeIcon className="dark:text-dark-200 size-4.5 text-gray-500" />
                          ) : (
                            <EyeSlashIcon className="dark:text-dark-200 size-4.5 text-gray-500" />
                          )}
                        </Button>
                      }
                    />
                  </div>
                  <div className="mt-6 flex justify-end space-x-2">
                    <Button onClick={closeForm} variant="flat">
                      Batal
                    </Button>
                    <Button onClick={() => {}}>Simpan</Button>
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
