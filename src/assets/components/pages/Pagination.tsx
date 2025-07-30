import React from "react";
import styles from "../css/InternshipSearch.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const MAX_VISIBLE_PAGES = 5;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const half = Math.floor(MAX_VISIBLE_PAGES / 2);

    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + MAX_VISIBLE_PAGES - 1, totalPages);

    if (end - start < MAX_VISIBLE_PAGES - 1) {
      start = Math.max(end - MAX_VISIBLE_PAGES + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {currentPage > 3 && (
        <>
          <button onClick={() => onPageChange(1)}>1</button>
          {currentPage > 4 && <span>...</span>}
        </>
      )}

      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={currentPage === page ? styles.activePage : ""}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && <span>...</span>}
          <button onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
