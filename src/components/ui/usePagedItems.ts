"use client";

import { useEffect, useMemo, useState } from "react";

type Options = {
  pageSize?: number;
};

export function usePagedItems<T>(items: T[], options: Options = {}) {
  const pageSize = options.pageSize ?? 5;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  return {
    page: safePage,
    setPage,
    pageSize,
    totalPages,
    total: items.length,
    pageItems,
    showPager: items.length > pageSize,
  };
}
