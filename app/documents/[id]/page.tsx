"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowLeft, FileUp, Pencil, ShieldCheck } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import StatusBadge from "@/components/documents/StatusBadge";
import UpdateRequiredBadge from "@/components/documents/UpdateRequiredBadge";
import VerificationStatusBadge from "@/components/documents/VerificationStatusBadge";
import ReplacePdfModal from "@/components/documents/ReplacePdfModal";
import { useDocuments } from "@/hooks/useDocuments";
import { useVerificationRunner } from "@/hooks/useVerificationRunner";
import { cn, formatDate } from "@/lib/utils";
import type { VerificationFieldSnapshot } from "@/types/document";

const VERIFICATION_FIELD_ORDER: Array<keyof VerificationFieldSnapshot> = [
  "name",
  "publishedYear",
  "lotNumber",
  "mg",
];

const VERIFICATION_FIELD_LABELS: Record<keyof VerificationFieldSnapshot, string> = {
  name: "Document Name",
  publishedYear: "Published Year",
  lotNumber: "Lot Number",
  mg: "Gramaje / MG",
};

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const { documents, getDocumentById, replacePdf, updateDocument, isReady } = useDocuments();
  const { isRunning, run } = useVerificationRunner({ documents, isReady, updateDocument });
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);

  if (!isReady) {
    return (
      <PageContainer title="Document">
        <p className="text-sm text-slate-400">Loading…</p>
      </PageContainer>
    );
  }

  const record = getDocumentById(params.id);

  if (!record) {
    return (
      <PageContainer title="Document not found">
        <p className="text-sm text-slate-400">
          This document doesn&apos;t exist or may have been removed.
        </p>
        <Link href="/documents" className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-400">
          Back to Documents
        </Link>
      </PageContainer>
    );
  }

  const documentId = record.id;

  const fields: Array<{ label: string; value: ReactNode }> = [
    { label: "Document Name", value: record.name },
    { label: "Type", value: record.type },
    { label: "Product", value: record.product ?? "—" },
    { label: "Version", value: record.version ?? "—" },
    { label: "Lot Number", value: record.lotNumber ?? "—" },
    { label: "Gramaje / MG", value: record.mg ?? "—" },
    { label: "Published Year", value: record.publishedYear ?? "—" },
    { label: "Public URL", value: record.publicUrl ?? "—" },
    { label: "Slug", value: record.slug ?? "—" },
    { label: "Created At", value: formatDate(record.createdAt) },
    { label: "Updated At", value: formatDate(record.updatedAt) },
  ];

  return (
    <PageContainer
      title={record.name}
      description={`${record.type} document`}
      actions={
        <Link
          href={`/documents/${record.id}/edit`}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      }
    >
      <Link
        href="/documents"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Documents
      </Link>

      <div className="mb-6 flex flex-wrap gap-3">
        <StatusBadge status={record.status} />
        <UpdateRequiredBadge updateRequired={record.updateRequired} />
        <VerificationStatusBadge verificationStatus={record.verificationStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-sm font-semibold text-white">Details</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.label}>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">{field.label}</dt>
                  <dd className="mt-1 break-words text-sm text-slate-200">{field.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Verification</h2>
              <button
                type="button"
                onClick={() => void run([documentId])}
                disabled={isRunning}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                {isRunning ? "Verifying…" : "Verify"}
              </button>
            </div>

            {record.verificationResult ? (
              <>
                <p className="mb-4 text-xs text-slate-500">
                  Last checked {formatDate(record.verificationResult.checkedAt)}
                </p>

                {record.verificationResult.message && (
                  <p className="mb-4 text-sm text-amber-400">{record.verificationResult.message}</p>
                )}

                {record.verificationResult.expected && record.verificationResult.found && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                          <th className="py-2 pr-4 font-medium">Field</th>
                          <th className="py-2 pr-4 font-medium">Expected</th>
                          <th className="py-2 font-medium">Found</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {VERIFICATION_FIELD_ORDER.map((field) => {
                          const isMismatched = record.verificationResult?.mismatchedFields?.includes(field);
                          return (
                            <tr key={field}>
                              <td className="py-2 pr-4 text-slate-400">
                                {VERIFICATION_FIELD_LABELS[field]}
                              </td>
                              <td
                                className={cn("py-2 pr-4", isMismatched ? "text-red-400" : "text-slate-200")}
                              >
                                {record.verificationResult?.expected?.[field] ?? "—"}
                              </td>
                              <td className={cn("py-2", isMismatched ? "text-red-400" : "text-slate-200")}>
                                {record.verificationResult?.found?.[field] ?? "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">Not yet verified.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-sm font-semibold text-white">QR Code</h2>
            <p className="text-xs uppercase tracking-wide text-slate-500">QR URL</p>
            <p className="mt-1 break-words text-sm text-slate-200">{record.qrUrl ?? "Not set"}</p>
            <p className="mt-2 text-xs text-slate-500">
              This is the URL printed QR codes resolve to. It stays stable even when the PDF behind it
              changes.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-sm font-semibold text-white">Current PDF</h2>
            <p className="mb-4 break-words text-sm text-slate-200">{record.pdfUrl ?? "Not set"}</p>
            <button
              type="button"
              onClick={() => setIsReplaceOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              <FileUp className="h-4 w-4" />
              Replace PDF
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-3 text-sm font-semibold text-white">PDF History</h2>
            {record.pdfHistory && record.pdfHistory.length > 0 ? (
              <ul className="space-y-3">
                {record.pdfHistory
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <li key={`${entry.pdfUrl}-${index}`} className="text-sm">
                      <p className="break-words text-slate-300">{entry.pdfUrl}</p>
                      <p className="text-xs text-slate-500">
                        Replaced {formatDate(entry.replacedAt)}
                        {entry.reason ? ` — ${entry.reason}` : ""}
                      </p>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No prior PDF versions recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      <ReplacePdfModal
        isOpen={isReplaceOpen}
        doc={record}
        onClose={() => setIsReplaceOpen(false)}
        onConfirm={(newPdfUrl, reason) => replacePdf(documentId, newPdfUrl, reason)}
      />
    </PageContainer>
  );
}
