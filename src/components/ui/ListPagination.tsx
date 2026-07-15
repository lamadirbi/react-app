"use client";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export function ListPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  label = "استشارة",
}: Props) {
  if (total <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="gc-list-pagination" role="navigation" aria-label="تنقل الصفحات">
      <p className="gc-list-pagination-meta">
        {from}–{to} من {total} {label}
      </p>
      <div className="gc-list-pagination-actions">
        <button
          type="button"
          className="gc-list-pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          السابق
        </button>
        <span className="gc-list-pagination-page">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="gc-list-pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          التالي
        </button>
      </div>
    </div>
  );
}
