"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import DocumentsToolbar, { type UpdateRequiredFilter } from "@/components/documents/DocumentsToolbar";
import DocumentsTable from "@/components/documents/DocumentsTable";
import { useDocuments } from "@/hooks/useDocuments";
import type { VerificationStatus } from "@/types/document";

export default function DocumentsPage() {
  const { documents, replacePdf, isReady } = useDocuments();
  const [search, setSearch] = useState("");
  const [publishedYear, setPublishedYear] = useState<number | "All">("All");
  const [updateRequired, setUpdateRequired] = useState<UpdateRequiredFilter>("All");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | "All">("All");

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

      {isReady ? (
        <DocumentsTable documents={filteredDocuments} onReplacePdf={replacePdf} />
      ) : (
        <p className="text-sm text-slate-400">Loading…</p>
      )}
    </PageContainer>
  );
}
