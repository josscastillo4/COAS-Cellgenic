"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { callVerifyApi, toVerificationPatch } from "@/services/verificationService";
import type { ProductDocument } from "@/types/document";

const CONCURRENCY = 4;

interface UseVerificationRunnerArgs {
  documents: ProductDocument[];
  isReady: boolean;
  updateDocument: (id: string, patch: Partial<ProductDocument>) => void;
}

/**
 * Client-driven batch verification runner. There is no database and Vercel
 * functions are stateless/short-lived, so this can't be a true background
 * job — the browser tab itself drives the loop with bounded concurrency,
 * writing each result to localStorage (via updateDocument) as it completes.
 * Closing the tab mid-run stops it; already-completed results are safe,
 * the untouched remainder just stays "Pending verification" until Verify
 * is run again.
 */
export function useVerificationRunner({ documents, isReady, updateDocument }: UseVerificationRunnerArgs) {
  const [isRunning, setIsRunning] = useState(false);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const cancelRef = useRef(false);
  const hasReconciledRef = useRef(false);

  useEffect(() => {
    // Any document left in "Verifying" is from a previously-interrupted run
    // (tab closed/refreshed mid-batch) — reset it once, after real data has
    // loaded, so it isn't permanently stuck and can be retried.
    if (!isReady || hasReconciledRef.current) return;
    hasReconciledRef.current = true;

    documents.forEach((doc) => {
      if (doc.verificationStatus === "Verifying") {
        updateDocument(doc.id, { verificationStatus: "Pending verification" });
      }
    });
  }, [isReady, documents, updateDocument]);

  const verifyOne = useCallback(
    async (doc: ProductDocument) => {
      updateDocument(doc.id, { verificationStatus: "Verifying" });
      const apiResponse = await callVerifyApi(doc);
      const patch = toVerificationPatch(doc, apiResponse);
      updateDocument(doc.id, patch);
    },
    [updateDocument]
  );

  const run = useCallback(
    async (ids: string[]) => {
      const targets = documents.filter((doc) => ids.includes(doc.id));
      if (targets.length === 0) return;

      cancelRef.current = false;
      setIsRunning(true);
      setTotal(targets.length);
      setCompleted(0);

      let nextIndex = 0;

      async function worker() {
        while (nextIndex < targets.length && !cancelRef.current) {
          const doc = targets[nextIndex];
          nextIndex += 1;
          await verifyOne(doc);
          setCompleted((prev) => prev + 1);
        }
      }

      const workerCount = Math.min(CONCURRENCY, targets.length);
      await Promise.all(Array.from({ length: workerCount }, () => worker()));

      setIsRunning(false);
    },
    [documents, verifyOne]
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return { isRunning, total, completed, run, cancel };
}
