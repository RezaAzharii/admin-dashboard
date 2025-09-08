  
const TableFilters = ({ selectedDate, setSelectedDate, onAddClick }) => {
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
          className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-gray-100"
        />
        <button
          onClick={onAddClick}
          className="transform rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700"
        >
          + Tambah Data
        </button>
      </div>
    </div>
  );
};

export default TableFilters;