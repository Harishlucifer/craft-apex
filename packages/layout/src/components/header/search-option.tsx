"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useHeaderStore } from "../../store/header-store";
import { useSearchTypesQuery } from "../../hooks/header-hooks";
import { cn } from "../../lib/utils";

/* ------------------------------------------------------------------ */
/*  SearchOption – search bar with dynamic search-type dropdown        */
/* ------------------------------------------------------------------ */

interface SearchOptionProps {
  /** Called when the user submits a search */
  onSearch?: (query: string, searchType: string) => void;
  /** Placeholder text */
  placeholder?: string;
}

export function SearchOption({
  onSearch,
  placeholder = "search by...",
}: SearchOptionProps) {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    searchTypes,
    selectedSearchType,
    searchQuery,
    setSelectedSearchType,
    setSearchQuery,
  } = useHeaderStore();

  // Fetch search types via TanStack Query
  useSearchTypesQuery();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery, selectedSearchType?.lu_key ?? "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };

  return (
    <form
      className="flex flex-1 items-center gap-0"
      onSubmit={handleSearchSubmit}
    >
      {/* Search Type selector */}
      <div className="relative flex items-center" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsTypeDropdownOpen((v) => !v)}
          className="flex h-8 items-center gap-1 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 outline-none transition-colors hover:bg-slate-100 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          id="search-type-selector"
        >
          <span className="max-w-[80px] truncate">
            {selectedSearchType?.lu_value ?? "Select..."}
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-slate-400 transition-transform",
              isTypeDropdownOpen && "rotate-180"
            )}
          />
        </button>

        {/* Type dropdown */}
        {isTypeDropdownOpen && searchTypes.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
            {searchTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setSelectedSearchType(type);
                  setIsTypeDropdownOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-1.5 text-xs transition-colors hover:bg-slate-50",
                  selectedSearchType?.id === type.id
                    ? "text-primary font-medium bg-primary/5"
                    : "text-slate-600"
                )}
              >
                {type.lu_value}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 w-full rounded-r-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-primary/50 focus:bg-white focus:ring-1 focus:ring-primary/20"
          id="header-search-input"
        />
      </div>
    </form>
  );
}
