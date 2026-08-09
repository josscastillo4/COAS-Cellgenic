"use client";

import { Search } from "lucide-react";
import type { VerificationStatus } from "@/types/document";

export type UpdateRequiredFilter = "All" | "Yes" | "No";

interface DocumentsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  publishedYearValue: number | "All";
  onPublishedYearChange: (value: number | "All") => void;
  publishedYears: number[];
  updateRequiredValue: UpdateRequiredFilter;
  onUpdateRequiredChange: (value: UpdateRequiredFilter) => void;
  verificationStatusValue: VerificationStatus | "All";
  onVerificationStatusChange: (value: VerificationStatus | "All") => void;
}

const UPDATE_REQUIRED_OPTIONS: UpdateRequiredFilter[] = ["All", "Yes", "No"];

const VERIFICATION_STATUS_OPTIONS: Array<VerificationStatus | "All"> = [
  "All",
  "Verified",
  "Mismatch",
  "Outdated",
  "Unverified",
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
  publishedYearValue,
  onPublishedYearChange,
  publishedYears,
  updateRequiredValue,
  onUpdateRequiredChange,
  verificationStatusValue,
  onVerificationStatusChange,
}: DocumentsToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[240px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by COA name or lot number..."
          className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      <select
        value={publishedYearValue}
        onChange={(event) =>
          onPublishedYearChange(event.target.value === "All" ? "All" : Number(event.target.value))
        }
        className={selectClasses}
        aria-label="Filter by published year"
      >
        <option value="All">All Years</option>
        {publishedYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <select
        value={updateRequiredValue}
        onChange={(event) => onUpdateRequiredChange(event.target.value as UpdateRequiredFilter)}
        className={selectClasses}
        aria-label="Filter by update required"
      >
        {UPDATE_REQUIRED_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? "All (Update Required)" : option === "Yes" ? "Update required" : "Up to date"}
          </option>
        ))}
      </select>

      <select
        value={verificationStatusValue}
        onChange={(event) =>
          onVerificationStatusChange(event.target.value as VerificationStatus | "All")
        }
        className={selectClasses}
        aria-label="Filter by verification status"
      >
        {VERIFICATION_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? "All Verification Statuses" : option}
          </option>
        ))}
      </select>
    </div>
  );
}
