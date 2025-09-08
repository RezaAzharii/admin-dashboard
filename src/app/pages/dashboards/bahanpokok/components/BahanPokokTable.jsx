const BahanPokokTable = ({ data, startIndex, onEdit, onDelete, currentUser }) => {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-xl dark:bg-dark-900">
      <table className="min-w-full border border-gray-200 dark:border-gray-700">
        <thead className="bg-gray-50 dark:bg-dark-900">
          <tr>
            <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
              #
            </th>
            <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
              Foto
            </th>
            <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
              Nama
            </th>
            <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
              Satuan
            </th>
            <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
              Stok Wajib
            </th>
            <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
              Up Stok
            </th>
            {!currentUser?.is_petugas_pasar && (
              <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase dark:border-gray-600 dark:text-gray-300">
                Aksi
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-dark-900">
          {data.map((item, index) => (
            <tr
              key={item.id}
              className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {startIndex + index + 1}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <img
                  src={`http://127.0.0.1:8000${item.foto}`}
                  alt={item.nama}
                  className="h-16 w-16 rounded-lg border border-gray-200 object-cover shadow-md dark:border-gray-600"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjNEI1NTYzIi8+CjxwYXRoIGQ9Ik0yNCAzMkMxOS41ODE3IDMyIDE2IDI4LjQxODMgMTYgMjRDMTYgMTkuNTgxNyAxOS41ODE3IDE2IDI0IDE2QzI4LjQxODMgMTYgMzIgMTkuNTgxNyAzMiAyNEMzMiAyOC40MTgzIDI4LjQxODMgMzIgMjQgMzJaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=";
                  }}
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.nama}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {item.satuan}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    item.stok_wajib
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                  }`}
                >
                  {item.stok_wajib}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    item.up_stok
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-dark-900 dark:text-gray-300"
                  }`}
                >
                  {item.up_stok}
                </span>
              </td>
              {!currentUser?.is_petugas_pasar && (
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-yellow-100 px-3 text-yellow-800 transition-all duration-200 hover:bg-yellow-200 dark:bg-yellow-600/20 dark:text-yellow-400 dark:hover:bg-yellow-600/30 dark:hover:text-yellow-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-red-100 px-3 text-red-800 transition-all duration-200 hover:bg-red-200 dark:bg-red-600/20 dark:text-red-400 dark:hover:bg-red-600/30 dark:hover:text-red-300"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan="7"
                className="py-8 text-center text-gray-500 dark:text-gray-400"
              >
                Tidak ada data untuk ditampilkan
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BahanPokokTable;