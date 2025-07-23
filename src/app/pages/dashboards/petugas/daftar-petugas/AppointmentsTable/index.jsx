import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";

import { Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { SelectedRowsActions } from "components/shared/table/SelectedRowsActions";
import { useBoxSize, useDidUpdate } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";
import { MenuAction } from "./MenuActions";

import API from "../../../../../../configs/api.config";

const isSafari = getUserAgentBrowser() === "Safari";
const MySwal = withReactContent(Swal);

export function AppointmentsTable() {
  const [appointments, setAppointments] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ Tambahkan ini

  const [autoResetPageIndex] = useSkipper();
  const theadRef = useRef();
  const { height: theadHeight } = useBoxSize({ ref: theadRef });

  const fetchUsers = async () => {
    setLoading(true); // ✅ aktifkan loading saat mulai fetch
    try {
      const response = await axios.get(API.USERS.INDEX, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const users = response.data?.data ?? [];

      const mappedUsers = users.map((user) => ({
        user_id: user.id,
        name: user.name,
        email: user.email,
        avatar: null,
      }));

      setAppointments(mappedUsers);
    } catch (error) {
      console.error("Gagal memuat data user:", error);
    } finally {
      setLoading(false); // ✅ matikan loading setelah selesai
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user_id) => {
    const confirm = await MySwal.fire({
      title: "Yakin hapus data ini?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(API.USERS.DELETE(user_id), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setAppointments((old) => old.filter((user) => user.user_id !== user_id));

      MySwal.fire("Terhapus!", "Data berhasil dihapus.", "success");
    } catch (err) {
      console.error("Gagal menghapus:", err);
      MySwal.fire("Gagal", "Gagal menghapus user.", "error");
    }
  };

  const handleEdit = async (user) => {
    const result = await MySwal.fire({
      title: "Edit User",
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Nama" value="${user.name}" />
        <input id="swal-email" class="swal2-input" placeholder="Email" value="${user.email}" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          name: document.getElementById("swal-name").value,
          email: document.getElementById("swal-email").value,
        };
      },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(API.USERS.UPDATE(user.user_id), result.value, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      fetchUsers();
      MySwal.fire("Tersimpan!", "Data berhasil diperbarui.", "success");
    } catch (err) {
      console.error("Gagal update:", err);
      MySwal.fire("Gagal", "Gagal memperbarui user.", "error");
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => handleEdit(row.original)}
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDelete(row.original.user_id)}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: appointments,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex,
  });

  useDidUpdate(() => table.resetRowSelection(), [appointments.length]);

  return (
    <div className="mt-4 sm:mt-5 lg:mt-6">
      <div className="table-toolbar flex items-center justify-between">
        <h2 className="dark:text-dark-100 truncate text-base font-medium tracking-wide text-gray-800">
          Daftar Petugas
        </h2>
        <div className="flex gap-1.5">
          <CollapsibleSearch
            placeholder="Search here..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <MenuAction />
        </div>
        </div>
      <Card className="relative mt-3">
        <div className="table-wrapper min-w-full overflow-x-auto">
          <Table hoverable className="w-full text-left rtl:text-right">
            <THead ref={theadRef}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      className="dark:bg-dark-800 dark:text-dark-100 bg-gray-200 text-left font-semibold text-gray-800 uppercase"
                    >
                      {header.column.getCanSort() ? (
                        <div
                          className="flex cursor-pointer items-center space-x-3 select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="flex-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </span>
                          <TableSortIcon sorted={header.column.getIsSorted()} />
                        </div>
                      ) : header.isPlaceholder ? null : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </THead>
            <TBody>
              {loading ? (
                <Tr>
                  <Td colSpan={columns.length} className="text-center py-4">
                    Memuat data...
                  </Td>
                </Tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <Tr
                    key={row.id}
                    className={clsx(
                      "dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200",
                      row.getIsSelected() &&
                        !isSafari &&
                        "row-selected after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500 after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id} className="align-middle text-left">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={columns.length} className="text-center py-4">
                    Tidak ada data ditemukan.
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>
        {table.getCoreRowModel().rows.length > 0 && (
          <div className="p-4 sm:px-5">
            <PaginationSection table={table} />
          </div>
        )}
        <SelectedRowsActions table={table} height={theadHeight} />
      </Card>
    </div>
  );
}
