"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import DocumentForm from "@/components/documents/DocumentForm";
import { useDocuments } from "@/hooks/useDocuments";
import type { DocumentInput } from "@/types/document";

export default function EditDocumentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getDocumentById, updateDocument, isReady } = useDocuments();

  if (!isReady) {
    return (
      <PageContainer title="Edit Document">
        <p className="text-sm text-slate-400">Loading…</p>
      </PageContainer>
    );
  }

  const record = getDocumentById(params.id);

  if (!record) {
    return (
      <PageContainer title="Document not found">
        <Link href="/documents" className="text-sm text-blue-500 hover:text-blue-400">
          Back to Documents
        </Link>
      </PageContainer>
    );
  }

  const documentId = record.id;

  function handleSubmit(values: DocumentInput) {
    updateDocument(documentId, values);
    router.push(`/documents/${documentId}`);
  }

  return (
    <PageContainer title={`Edit — ${record.name}`} description="Update this document's details.">
      <Link
        href={`/documents/${record.id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to document
      </Link>

      <DocumentForm
        initialValues={record}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/documents/${documentId}`)}
      />
    </PageContainer>
  );
}
