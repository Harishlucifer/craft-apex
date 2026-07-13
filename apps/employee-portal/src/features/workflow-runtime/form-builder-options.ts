import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FormFieldDef, FormFieldOption } from "./form-builder.types";

/**
 * Substitute `{{fieldName}}` placeholders in a URL with form values.
 * Mirrors legacy `craft-formbuilder.es.js` `md(t, n)` helper.
 */
function substitutePlaceholders(
  url: string,
  values: Record<string, unknown>
): string {
  return url.replace(/{{(.*?)}}/g, (_, key: string) => {
    const v = values[key];
    if (v === undefined || v === null || v === "") {
      // Legacy fallback: `foo.keyword` → `foo` (Elasticsearch convention).
      if (key.endsWith(".keyword")) {
        const stripped = key.replace(/\.keyword$/, "");
        const fallback = values[stripped];
        return fallback == null ? "" : String(fallback);
      }
      return "";
    }
    return String(v);
  });
}

/**
 * Decide whether we have enough form state to fetch.
 * Legacy semantics (`fetchFieldOptions`):
 *   - If any field in `dependentOn` is empty AND the URL doesn't contain
 *     `page=`, skip the fetch (silent — options stay empty).
 *   - Otherwise, fetch (and refetch when any dependent value changes).
 */
function canFetch(
  field: FormFieldDef,
  values: Record<string, unknown>,
  resolvedUrl: string
): boolean {
  if (!field.dependentOn || field.dependentOn.length === 0) return true;
  const hasPageParam = resolvedUrl.includes("page=");
  for (const dep of field.dependentOn) {
    const v = values[dep];
    if ((v === undefined || v === null || v === "") && !hasPageParam) {
      return false;
    }
  }
  return true;
}

/**
 * Determine if a fieldType should attempt to load options at all.
 * Mirrors legacy `processFieldLogic` — dropdown-shaped + text-auto-complete.
 */
function isOptionField(fieldType?: string): boolean {
  if (!fieldType) return false;
  return fieldType.includes("dropdown") || fieldType === "text-auto-complete";
}

export interface AsyncFieldOptions {
  /** Merged options: async-loaded first, then any static fallback. */
  options: FormFieldOption[];
  isLoading: boolean;
  /** True when the URL has unresolved placeholders / missing deps. */
  blocked: boolean;
}

interface ResponseEnvelope {
  result?: unknown;
  data?: unknown;
  results?: unknown;
}

/**
 * Hook that resolves field options from `field.source.api` (when set), using
 * React Query for caching. Falls back to static `field.options` /
 * `field.source.options` when no API is configured.
 *
 * Verbatim port of legacy craft-formbuilder behavior:
 *   - default `labelKey = "name"`, `valueKey = "id"`
 *   - response body extracted as `result ?? data ?? results ?? []`
 *   - each row mapped to `{ label: row[labelKey], value: row[valueKey], item: row }`
 *   - `dependentOn` triggers refetch via `{{depField}}` URL substitution
 *   - `alwayRefresh` is respected via `staleTime: 0`
 */
export function useAsyncFieldOptions(
  field: FormFieldDef,
  allValues: Record<string, unknown>
): AsyncFieldOptions {
  const apiUrl = field.source?.api ?? "";
  const labelKey = field.source?.labelKey ?? "name";
  const valueKey = field.source?.valueKey ?? "id";
  const alwaysRefresh = field.source?.alwayRefresh === true;

  const resolvedUrl = useMemo(
    () => (apiUrl ? substitutePlaceholders(apiUrl, allValues) : ""),
    [apiUrl, allValues]
  );

  const allowed = isOptionField(field.fieldType);
  const fetchable =
    allowed && Boolean(apiUrl) && canFetch(field, allValues, resolvedUrl);

  const query = useQuery<FormFieldOption[]>({
    queryKey: ["fb-async-options", resolvedUrl],
    enabled: fetchable && resolvedUrl !== "",
    staleTime: alwaysRefresh ? 0 : 5 * 60_000,
    queryFn: async () => {
      const body = await api.get<unknown, ResponseEnvelope>(resolvedUrl);
      const raw =
        (body as ResponseEnvelope)?.result ??
        (body as ResponseEnvelope)?.data ??
        (body as ResponseEnvelope)?.results ??
        [];
      const rows = Array.isArray(raw) ? raw : [];
      return rows.map((row: any): FormFieldOption => ({
        label: row?.[labelKey] ?? "",
        value: row?.[valueKey] ?? "",
        item: row,
      }));
    },
  });

  const staticOptions: FormFieldOption[] = useMemo(
    () => field.options ?? field.source?.options ?? [],
    [field.options, field.source?.options]
  );

  const options = useMemo(() => {
    if (!apiUrl) return staticOptions;
    return query.data ?? [];
  }, [apiUrl, query.data, staticOptions]);

  return {
    options,
    isLoading: query.isFetching,
    blocked: Boolean(apiUrl) && !fetchable,
  };
}

/**
 * Build a nested payload from a form_builder step's flat `value` object.
 *
 * A `FormFieldDef.name` is meant to be the exact dotted path into the
 * backend's expected JSON (e.g. `"user_role.role_id"`, not an arbitrary
 * alias like `"role"`) — so submitting a step never needs per-field
 * remapping code downstream. Mirrors `setNestedValue` from craft-ux's
 * DynamicForm submit path (packages/craft-ux/src/utils/utils.ts), minus its
 * `field[index]` array-path support, which no current form_builder step
 * needs.
 */
export function buildNestedFormPayload(
  values: Record<string, unknown>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [path, value] of Object.entries(values)) {
    const keys = path.split(".");
    let cursor = result;
    keys.forEach((key, i) => {
      if (i === keys.length - 1) {
        cursor[key] = value;
      } else {
        if (typeof cursor[key] !== "object" || cursor[key] === null) {
          cursor[key] = {};
        }
        cursor = cursor[key];
      }
    });
  }
  return result;
}
