"use client";

import { Search } from "lucide-react";
import type { DocumentStatus, DocumentType } from "@/types/document";

interface DocumentsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  typeValue: DocumentType | "All";
  onTypeChange: (value: DocumentType | "All") => void;
  statusValue: DocumentStatus | "All";
  onStatusChange: (value: DocumentStatus | "All") => void;
}

const DOCUMENT_TYPES: Array<DocumentType | "All"> = [
  "All",
  "COA",
  "MSDS",
  "IFU",
  "Brochure",
];

const DOCUMENT_STATUSES: Array<DocumentStatus | "All"> = [
  "All",
  "Active",
  "Archived",
  "Draft",
];

const selectClasses =
  "w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-3 pr-8 text-sm text-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:w-auto";

/**
 * Controlled search + filter bar for the Documents table.
 * Purely presentational — all state lives in the parent page so filtering
 * logic stays in one place.
 */
export default function DocumentsToolbar({
  searchValue,
  onSearchChange,
  typeValue,
  onTypeChange,
  statusValue,
  onStatusChange,
}: DocumentsToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search documents, products..."
          className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      <select
        value={typeValue}
        onChange={(event) => onTypeChange(event.target.value as DocumentType | "All")}
        className={selectClasses}
        aria-label="Filter by document type"
      >
        {DOCUMENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {type === "All" ? "All Types" : type}
          </option>
        ))}
      </select>

      <select
        value={statusValue}
        onChange={(event) => onStatusChange(event.target.value as DocumentStatus | "All")}
        className={selectClasses}
        aria-label="Filter by status"
      >
        {DOCUMENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status === "All" ? "All Statuses" : status}
          </option>
        ))}
      </select>
    </div>
  );
}
