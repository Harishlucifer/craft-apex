import { useEffect, useMemo, useState } from "react";

/**
 * Tiny client-side list-state helper for legacy endpoints that return the
 * full array (no server pagination). Owns search + page + pageSize and the
 * derived `paged` slice. Pages still write their own columns/markup; this
 * is UI plumbing, not a data abstraction.
 */
export function useClientList<T>(
  rows: T[],
  filterFn?: (row: T, query: string) => boolean
) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !filterFn) return rows;
    return rows.filter((r) => filterFn(r, q));
  }, [rows, search, filterFn]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  return {
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    paged,
  };
}
