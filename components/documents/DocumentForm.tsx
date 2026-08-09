"use client";

import { useState, type FormEvent } from "react";
import { cn, formatDate, slugify } from "@/lib/utils";
import type { DocumentInput, DocumentStatus, DocumentType, ProductDocument } from "@/types/document";

interface DocumentFormProps {
  /** When provided, the form is pre-filled for editing; otherwise it's a blank create form. */
  initialValues?: ProductDocument;
  submitLabel: string;
  onSubmit: (values: DocumentInput) => void;
  onCancel: () => void;
}

const DOCUMENT_TYPES: DocumentType[] = ["COA", "MSDS", "IFU", "Brochure", "Package Insert"];
const DOCUMENT_STATUSES: DocumentStatus[] = ["Active", "Archived", "Draft"];

const inputClasses =
  "w-full rounded-lg border border-slate-800 bg-slate-900 py-2 px-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

const labelClasses = "mb-1.5 block text-sm font-medium text-slate-300";

const sectionClasses = "rounded-xl border border-slate-800 bg-slate-900 p-6";

/**
 * Shared create/edit form for Document/COA records. `pdfUrl` is intentionally
 * read-only here — it should only change via the Replace PDF flow so the
 * replacement gets recorded in pdfHistory instead of silently overwritten.
 */
export default function DocumentForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: DocumentFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [type, setType] = useState<DocumentType>(initialValues?.type ?? "COA");
  const [status, setStatus] = useState<DocumentStatus>(initialValues?.status ?? "Draft");
  const [product, setProduct] = useState(initialValues?.product ?? "");
  const [version, setVersion] = useState(initialValues?.version ?? "");
  const [publicUrl, setPublicUrl] = useState(initialValues?.publicUrl ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [publishedYear, setPublishedYear] = useState(
    initialValues?.publishedYear ? String(initialValues.publishedYear) : ""
  );
  const [lotNumber, setLotNumber] = useState(initialValues?.lotNumber ?? "");
  const [mg, setMg] = useState(initialValues?.mg ?? "");
  const [qrUrl, setQrUrl] = useState(initialValues?.qrUrl ?? "");
  const [updateRequired, setUpdateRequired] = useState(initialValues?.updateRequired ?? false);

  function handleNameBlur() {
    if (!slugTouched && name.trim().length > 0) {
      setSlug(slugify(name));
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      type,
      status,
      product: product.trim() || undefined,
      version: version.trim() || undefined,
      publicUrl: publicUrl.trim() || undefined,
      slug: slug.trim() || undefined,
      publishedYear: publishedYear ? Number(publishedYear) : undefined,
      lotNumber: lotNumber.trim() || undefined,
      mg: mg.trim() || undefined,
      qrUrl: qrUrl.trim() || undefined,
      updateRequired,
      // verificationStatus intentionally omitted — it's never manually
      // assigned, only set by the real verification flow.
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={sectionClasses}>
        <h2 className="mb-4 text-sm font-semibold text-white">Document details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClasses} htmlFor="name">
              Document Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={handleNameBlur}
              placeholder="Certificate of Analysis - Lot 4821"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="type">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(event) => setType(event.target.value as DocumentType)}
              className={inputClasses}
            >
              {DOCUMENT_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as DocumentStatus)}
              className={inputClasses}
            >
              {DOCUMENT_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses} htmlFor="product">
              Product
            </label>
            <input
              id="product"
              type="text"
              value={product}
              onChange={(event) => setProduct(event.target.value)}
              placeholder="Optional"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="version">
              Version
            </label>
            <input
              id="version"
              type="text"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
              placeholder="Optional, e.g. v1.0"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      <div className={sectionClasses}>
        <h2 className="mb-4 text-sm font-semibold text-white">COA / Excel fields</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClasses} htmlFor="publicUrl">
              Public URL
            </label>
            <input
              id="publicUrl"
              type="url"
              value={publicUrl}
              onChange={(event) => setPublicUrl(event.target.value)}
              placeholder="https://cellgenic.com/coa/..."
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-slate-500">
              The stable URL the QR code resolves to. Changing this can break existing printed QR codes.
            </p>
          </div>

          <div>
            <label className={labelClasses} htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugTouched(true);
              }}
              placeholder="auto-generated from name"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="publishedYear">
              Published Year
            </label>
            <input
              id="publishedYear"
              type="number"
              value={publishedYear}
              onChange={(event) => setPublishedYear(event.target.value)}
              placeholder="2026"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="lotNumber">
              Lot Number
            </label>
            <input
              id="lotNumber"
              type="text"
              value={lotNumber}
              onChange={(event) => setLotNumber(event.target.value)}
              placeholder="4821"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="mg">
              Gramaje / MG
            </label>
            <input
              id="mg"
              type="text"
              value={mg}
              onChange={(event) => setMg(event.target.value)}
              placeholder="50mg"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="qrUrl">
              QR URL
            </label>
            <input
              id="qrUrl"
              type="url"
              value={qrUrl}
              onChange={(event) => setQrUrl(event.target.value)}
              placeholder="https://cellgenic.com/coa/..."
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-slate-500">
              Where the printed QR code redirects to. Kept stable across PDF replacements.
            </p>
          </div>

          <div>
            <span className={labelClasses}>PDF URL</span>
            <div className={cn(inputClasses, "cursor-not-allowed truncate text-slate-500")}>
              {initialValues?.pdfUrl ?? "Not set"}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Use the &quot;Replace PDF&quot; action on the document page to change this — it keeps an
              audit history.
            </p>
          </div>
        </div>
      </div>

      <div className={sectionClasses}>
        <h2 className="mb-4 text-sm font-semibold text-white">Review flags</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className={labelClasses}>Verification Status</span>
            <div className={cn(inputClasses, "cursor-not-allowed text-slate-500")}>
              {initialValues?.verificationStatus ?? "Pending verification"}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Automatically calculated by the Verify action — never manually assigned. See the
              document page for full verification detail.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-7">
            <input
              id="updateRequired"
              type="checkbox"
              checked={updateRequired}
              onChange={(event) => setUpdateRequired(event.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="updateRequired" className="text-sm text-slate-300">
              Update required (ACTUALIZAR PDF)
            </label>
          </div>
        </div>

        {initialValues && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-800 pt-4 text-xs text-slate-500">
            <span>Created: {formatDate(initialValues.createdAt)}</span>
            <span>Last updated: {formatDate(initialValues.updatedAt)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
