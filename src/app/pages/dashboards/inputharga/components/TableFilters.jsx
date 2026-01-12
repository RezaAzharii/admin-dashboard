  
const TableFilters = ({ selectedDate, setSelectedDate, onAddClick, onApproveAll, hasPendingItems, listPasar, selectedPasar, setSelectedPasar, currentUser }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="dark:text-dark-50 text-2xl font-bold text-gray-800">
        Daftar Harga Bahan Pokok
      </h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-dark-900 dark:text-gray-100 dark:border-gray-600"
        />
        
        {currentUser?.is_admin ? (
          <select
            value={selectedPasar}
            onChange={(e) => setSelectedPasar(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-dark-900 dark:text-gray-100 dark:border-gray-600"
          >
            <option value="">Semua Pasar</option>
            {listPasar.map((pasar) => (
              <option key={pasar.id} value={pasar.id}>
                {pasar.nama}
              </option>
            ))}
          </select>
        ) : (
          <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600 dark:bg-dark-800 dark:text-gray-400 dark:border-gray-600">
            {currentUser?.pasar?.nama || "Pasar Terkunci"}
          </div>
        )}

        <button
          onClick={onAddClick}
          className="transform rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700"
        >
          + Tambah Data
        </button>
        {onApproveAll && (
          <button
            onClick={onApproveAll}
            disabled={!hasPendingItems}
            className={`transform rounded-lg px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 ${
              hasPendingItems
                ? "bg-green-600 hover:scale-105 hover:bg-green-700"
                : "cursor-not-allowed bg-gray-500 opacity-50"
            }`}
          >
            Setujui Semua {selectedPasar ? `(${listPasar.find(p => String(p.id) === String(selectedPasar))?.nama})` : ""}
          </button>
        )}
      </div>
    </div>
  );
};

export default TableFilters;