"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, ShieldCheck, Trash2, Upload } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import ConfirmDialog from "@/components/ConfirmDialog";
import DocumentsToolbar, { type UpdateRequiredFilter } from "@/components/documents/DocumentsToolbar";
import DocumentsTable from "@/components/documents/DocumentsTable";
import { useDocuments } from "@/hooks/useDocuments";
import { useVerificationRunner } from "@/hooks/useVerificationRunner";
import type { VerificationStatus } from "@/types/document";

export default function DocumentsPage() {
  const { documents, replacePdf, deleteDocuments, updateDocument, isReady } = useDocuments();
  const { isRunning, total, completed, run } = useVerificationRunner({
    documents,
    isReady,
    updateDocument,
  });

  const [search, setSearch] = useState("");
  const [publishedYear, setPublishedYear] = useState<number | "All">("All");
  const [updateRequired, setUpdateRequired] = useState<UpdateRequiredFilter>("All");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | "All">("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const publishedYears = useMemo(() => {
    const years = new Set<number>();
    documents.forEach((doc) => {
      if (doc.publishedYear) years.add(doc.publishedYear);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((doc) => {
      const matchesSearch =
        query.length === 0 ||
        doc.name.toLowerCase().includes(query) ||
        (doc.lotNumber ?? "").toLowerCase().includes(query);
      const matchesYear = publishedYear === "All" || doc.publishedYear === publishedYear;
      const matchesUpdateRequired =
        updateRequired === "All" ||
        (updateRequired === "Yes" ? doc.updateRequired === true : !doc.updateRequired);
      const matchesVerification =
        verificationStatus === "All" || doc.verificationStatus === verificationStatus;

      return matchesSearch && matchesYear && matchesUpdateRequired && matchesVerification;
    });
  }, [documents, search, publishedYear, updateRequired, verificationStatus]);

  function handleToggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleToggleAll() {
    setSelectedIds((prev) => {
      const allVisibleSelected = filteredDocuments.every((doc) => prev.has(doc.id));
      if (allVisibleSelected) return new Set();
      return new Set(filteredDocuments.map((doc) => doc.id));
    });
  }

  function handleDeleteSelected() {
    deleteDocuments(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsConfirmingDelete(false);
  }

  function handleVerifySelected() {
    void run(Array.from(selectedIds));
  }

  function handleVerifyAll() {
    void run(documents.map((doc) => doc.id));
  }

  function handleVerifyOne(id: string) {
    void run([id]);
  }

  return (
    <PageContainer
      title="Documents"
      description="Manage all product documentation."
      actions={
        <div className="flex items-center gap-3">
          <Link
            href="/documents/import"
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            <Upload className="h-4 w-4" />
            Import from Excel
          </Link>
          <button
            type="button"
            onClick={handleVerifyAll}
            disabled={isRunning || documents.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            Verify All
          </button>
          <Link
            href="/documents/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            New Document
          </Link>
        </div>
      }
    >
      <DocumentsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        publishedYearValue={publishedYear}
        onPublishedYearChange={setPublishedYear}
        publishedYears={publishedYears}
        updateRequiredValue={updateRequired}
        onUpdateRequiredChange={setUpdateRequired}
        verificationStatusValue={verificationStatus}
        onVerificationStatusChange={setVerificationStatus}
      />

      {isRunning && (
        <div className="mb-4 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          Verifying {completed} / {total}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
          <span className="text-sm text-slate-300">{selectedIds.size} selected</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleVerifySelected}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              Verify Selected
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center gap-2 rounded-lg border border-red-900 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {isReady ? (
        <DocumentsTable
          documents={filteredDocuments}
          selectedIds={selectedIds}
          onToggleRow={handleToggleRow}
          onToggleAll={handleToggleAll}
          onReplacePdf={replacePdf}
          onVerify={handleVerifyOne}
        />
      ) : (
        <p className="text-sm text-slate-400">Loading…</p>
      )}

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title="Delete selected documents?"
        description={`This will permanently delete ${selectedIds.size} document${selectedIds.size === 1 ? "" : "s"}. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteSelected}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </PageContainer>
  );
}
