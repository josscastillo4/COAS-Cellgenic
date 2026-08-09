"use client";

import type { ExcelColumnMapping } from "@/types/import";

interface ColumnMappingEditorProps {
  headers: string[];
  mapping: ExcelColumnMapping;
  onChange: (mapping: ExcelColumnMapping) => void;
}

const FIELD_LABELS: Record<keyof ExcelColumnMapping, string> = {
  documentName: "Document Name (COA NAME)",
  publicUrl: "Public URL (Link)",
  datePublished: "Published Year (Date Published)",
  lotNumber: "Lot Number (LOT Number)",
  qrUrl: "QR URL (QR) — text fallback, embedded QR images take priority",
  updateRequired: "Update Required (ACTUALIZAR PDF)",
  mg: "Gramaje / MG (optional)",
};

const FIELD_ORDER: Array<keyof ExcelColumnMapping> = [
  "documentName",
  "publicUrl",
  "datePublished",
  "lotNumber",
  "qrUrl",
  "updateRequired",
  "mg",
];

const selectClasses =
  "w-full rounded-lg border border-slate-800 bg-slate-900 py-2 px-3 text-sm text-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

/**
 * Every expected field is always an editable dropdown over the file's actual
 * headers — pre-filled with whatever detectColumnMapping guessed, so a wrong
 * auto-detected guess can be corrected, not just a missing one filled in.
 */
export default function ColumnMappingEditor({ headers, mapping, onChange }: ColumnMappingEditorProps) {
  function handleFieldChange(field: keyof ExcelColumnMapping, value: string) {
    onChange({ ...mapping, [field]: value === "" ? null : value });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-1 text-sm font-semibold text-white">Column Mapping</h2>
      <p className="mb-4 text-xs text-slate-400">
        Confirm which column in your file maps to each field. Auto-detected columns are pre-filled —
        adjust any that are wrong or missing.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELD_ORDER.map((field) => (
          <div key={field}>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor={`mapping-${field}`}>
              {FIELD_LABELS[field]}
            </label>
            <select
              id={`mapping-${field}`}
              value={mapping[field] ?? ""}
              onChange={(event) => handleFieldChange(field, event.target.value)}
              className={selectClasses}
            >
              <option value="">— Select column —</option>
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
