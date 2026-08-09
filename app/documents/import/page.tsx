"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileSpreadsheet, UploadCloud } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import ColumnMappingEditor from "@/components/documents/import/ColumnMappingEditor";
import ImportPreviewTable from "@/components/documents/import/ImportPreviewTable";
import ImportSummaryCard from "@/components/documents/import/ImportSummaryCard";
import { useDocuments } from "@/hooks/useDocuments";
import {
  buildImportRows,
  detectColumnMapping,
  parseWorkbook,
  summarize,
} from "@/services/excelImportService";
import type { ExcelColumnMapping, ImportRow, ImportSummary, ParsedWorkbook } from "@/types/import";

type WizardStep = "select" | "mapping" | "preview" | "summary";

const MAPPING_FIELDS: Array<keyof ExcelColumnMapping> = [
  "documentName",
  "publicUrl",
  "datePublished",
  "lotNumber",
  "qrUrl",
  "updateRequired",
];

function isMappingComplete(mapping: ExcelColumnMapping): boolean {
  return MAPPING_FIELDS.every((field) => Boolean(mapping[field]));
}

/**
 * Excel Import wizard: select -> column mapping -> preview/validation ->
 * confirm -> summary. Nothing is saved until "Confirm Import" is clicked —
 * parsing and validation are pure client-side steps against the file only.
 */
export default function ImportDocumentsPage() {
  const router = useRouter();
  const { documents, importDocuments } = useDocuments();

  const [step, setStep] = useState<WizardStep>("select");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedWorkbook | null>(null);
  const [mapping, setMapping] = useState<ExcelColumnMapping | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[] | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [result, setResult] = useState<{ imported: number; duplicates: number; errors: number } | null>(
    null
  );

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setFileError(null);

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setFileError("Please select a .xlsx file.");
      return;
    }

    setFileName(file.name);
    setIsParsing(true);

    try {
      const workbook = await parseWorkbook(file);
      if (workbook.rows.length === 0) {
        setFileError("This file has no data rows to import.");
        return;
      }
      setParsed(workbook);
      setMapping(detectColumnMapping(workbook.headers));
      setStep("mapping");
    } catch {
      setFileError("Could not read this file. Make sure it's a valid, uncorrupted .xlsx file.");
    } finally {
      setIsParsing(false);
    }
  }

  function handleContinueToPreview() {
    if (!parsed || !mapping) return;
    const rows = buildImportRows(parsed.rows, mapping, documents);
    setImportRows(rows);
    setSummary(summarize(rows));
    setStep("preview");
  }

  function handleConfirmImport() {
    if (!importRows) return;
    const validInputs = importRows.filter((row) => row.status === "valid").map((row) => row.input);
    importDocuments(validInputs);
    setResult({
      imported: validInputs.length,
      duplicates: importRows.filter((row) => row.status === "duplicate").length,
      errors: importRows.filter((row) => row.status === "invalid").length,
    });
    setStep("summary");
  }

  function handleReset() {
    setStep("select");
    setFileName(null);
    setFileError(null);
    setParsed(null);
    setMapping(null);
    setImportRows(null);
    setSummary(null);
    setResult(null);
  }

  return (
    <PageContainer
      title="Import from Excel"
      description="Bring the existing COA records from the Excel workflow into the app."
    >
      <Link
        href="/documents"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Documents
      </Link>

      {step === "select" && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-4 w-fit rounded-full bg-slate-800 p-3">
            <UploadCloud className="h-6 w-6 text-slate-400" />
          </div>
          <h2 className="text-base font-medium text-white">Select an Excel file</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
            Choose the .xlsx file exported from the current COA spreadsheet. Nothing is imported until
            you review a preview and confirm.
          </p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500">
            <FileSpreadsheet className="h-4 w-4" />
            {isParsing ? "Reading file..." : "Choose file"}
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              disabled={isParsing}
              onChange={handleFileChange}
            />
          </label>

          {fileName && !fileError && <p className="mt-4 text-sm text-slate-300">Selected: {fileName}</p>}
          {fileError && <p className="mt-4 text-sm text-red-400">{fileError}</p>}
        </div>
      )}

      {step === "mapping" && parsed && mapping && (
        <div className="space-y-4">
          <ColumnMappingEditor headers={parsed.headers} mapping={mapping} onChange={setMapping} />
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
            >
              Choose a different file
            </button>
            <button
              type="button"
              onClick={handleContinueToPreview}
              disabled={!isMappingComplete(mapping)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Preview
            </button>
          </div>
        </div>
      )}

      {step === "preview" && importRows && summary && (
        <div className="space-y-4">
          <ImportPreviewTable rows={importRows} summary={summary} />
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep("mapping")}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
            >
              Back to mapping
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={summary.validRows === 0}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm Import ({summary.validRows} rows)
            </button>
          </div>
        </div>
      )}

      {step === "summary" && result && (
        <ImportSummaryCard
          imported={result.imported}
          duplicates={result.duplicates}
          errors={result.errors}
          onImportAnother={handleReset}
          onViewDocuments={() => router.push("/documents")}
        />
      )}
    </PageContainer>
  );
}
