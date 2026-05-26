// Bureau Reports List — no real endpoint in legacy.
//
// The legacy page (BureauReporsListView.js) hardcodes the data; there is no
// GET / POST behind it. This module exposes the mock through a React-Query
// shaped hook so the page reads the same way as the real reports — once an
// endpoint exists, only this file changes.

import { useQuery } from "@tanstack/react-query";
import {
  BUREAU_REPORTS_MOCK,
  type BureauReportRow,
} from "./bureau-reports-list.types";

export function useBureauReportsList() {
  return useQuery({
    queryKey: ["bureau-reports-list"],
    queryFn: async (): Promise<BureauReportRow[]> => BUREAU_REPORTS_MOCK,
    staleTime: Infinity,
  });
}
