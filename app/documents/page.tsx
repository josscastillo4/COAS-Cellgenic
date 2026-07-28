"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import DocumentsToolbar from "@/components/documents/DocumentsToolbar";
import DocumentsTable from "@/components/documents/DocumentsTable";
import { MOCK_DOCUMENTS } from "@/data/documents";
import type { DocumentStatus, DocumentType } from "@/types/document";

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "All">("All");

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return MOCK_DOCUMENTS.filter((doc) => {
      const matchesSearch =
        query.length === 0 ||
        doc.name.toLowerCase().includes(query) ||
        doc.product.toLowerCase().includes(query);
      const matchesType = typeFilter === "All" || doc.type === typeFilter;
      const matchesStatus = statusFilter === "All" || doc.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  return (
    <PageContainer
      title="Documents"
      description="Manage all product documentation."
      actions={
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          New Document
        </button>
      }
    >
      <DocumentsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        typeValue={typeFilter}
        onTypeChange={setTypeFilter}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <DocumentsTable documents={filteredDocuments} />
    </PageContainer>
  );
}
