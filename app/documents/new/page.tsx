"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import DocumentForm from "@/components/documents/DocumentForm";
import { useDocuments } from "@/hooks/useDocuments";
import type { DocumentInput } from "@/types/document";

export default function NewDocumentPage() {
  const router = useRouter();
  const { createDocument } = useDocuments();

  function handleSubmit(values: DocumentInput) {
    const created = createDocument(values);
    router.push(`/documents/${created.id}`);
  }

  return (
    <PageContainer title="New Document" description="Add a new document/COA record.">
      <Link
        href="/documents"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Documents
      </Link>

      <DocumentForm
        submitLabel="Create document"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/documents")}
      />
    </PageContainer>
  );
}
