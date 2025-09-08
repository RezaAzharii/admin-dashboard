const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mx-1 rounded border border-gray-600 bg-gray-50 dark:bg-dark-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ‹
      </button>
    );

      
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`mx-1 rounded border px-3 py-2 text-sm font-medium ${
            currentPage === i
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-600 bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-gray-100 hover:bg-gray-600"
          }`}
        >
          {i}
        </button>
      );
    }

      
    buttons.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="mx-1 rounded border border-gray-600 bg-gray-50 dark:bg-dark-900 px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ›
      </button>
    );

    return buttons;
  };

  return <div className="flex items-center">{renderPaginationButtons()}</div>;
};

export default Pagination;