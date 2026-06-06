import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { api, ApiError } from "../api";
import { logger } from "../lib/logger";

interface FileDropZoneProps {
  currentFileIds: string[];
  onFileAccepted: (fileIds: string[]) => void;
  caseId: number;
  stepId: number;
  isLocked?: boolean;
}

// Kept in sync with the server (server/handlers/case.py: MAX_SIZE_BYTES).
// Validating client-side gives instant feedback and avoids a doomed round-trip.
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

// Single source of truth for accepted uploads. Mirrors the server's
// ALLOWED_EXTENSIONS so the dropzone, the UI copy, and the rejection message
// can never drift apart.
const ACCEPTED_TYPES: Accept = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
};

// Human-readable list derived from the extensions above (e.g. "PDF, PNG, JPG, …").
const ACCEPTED_LABEL = [
  ...new Set(
    Object.values(ACCEPTED_TYPES)
      .flat()
      .map((ext) => ext.replace(".", "").toUpperCase()),
  ),
].join(", ");

function formatMegabytes(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/** Turn an unknown thrown value into a message safe to show the user. */
function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred.";
}

/** Translate react-dropzone's rejection codes into friendly, specific copy. */
function describeRejection(rejection: FileRejection): string {
  const reasons = rejection.errors.map((err) => {
    switch (err.code) {
      case "file-too-large":
        return `it exceeds the ${formatMegabytes(MAX_FILE_SIZE_BYTES)} limit`;
      case "file-invalid-type":
        return `unsupported type — allowed: ${ACCEPTED_LABEL}`;
      case "too-many-files":
        return "too many files were dropped at once";
      default:
        return err.message;
    }
  });
  return `“${rejection.file.name}”: ${reasons.join(", ")}.`;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  currentFileIds,
  onFileAccepted,
  caseId,
  stepId,
  isLocked = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard against setting state after the component unmounts mid-upload.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (isLocked || uploading) return;

      // A fresh drop supersedes any previous error; start by reporting rejections.
      const messages: string[] = [];
      if (rejections.length > 0) {
        logger.warn("Files rejected before upload", {
          caseId,
          stepId,
          rejected: rejections.map((r) => ({
            name: r.file.name,
            codes: r.errors.map((e) => e.code),
          })),
        });
        messages.push(...rejections.map(describeRejection));
      }
      setError(messages.length > 0 ? messages.join("\n") : null);

      if (acceptedFiles.length === 0) return;

      setUploading(true);
      const failures: string[] = [];

      try {
        // Upload sequentially so a partial failure leaves earlier files saved
        // and the server-side fileIds array stays consistent.
        for (const file of acceptedFiles) {
          try {
            const updatedCase = await api.uploadFile(caseId, stepId, file);
            const updatedStep = updatedCase.steps.find((s) => s.id === stepId);
            if (updatedStep?.fileIds) {
              onFileAccepted(updatedStep.fileIds);
            }
            logger.info("File uploaded", { caseId, stepId, fileName: file.name });
          } catch (err) {
            logger.error("File upload failed", {
              caseId,
              stepId,
              fileName: file.name,
              status: err instanceof ApiError ? err.status : undefined,
              error: err,
            });
            failures.push(`“${file.name}”: ${toErrorMessage(err)}`);
          }
        }
      } finally {
        if (mountedRef.current) {
          setUploading(false);
          const all = [...messages, ...failures];
          setError(all.length > 0 ? all.join("\n") : null);
        }
      }
    },
    [caseId, stepId, isLocked, uploading, onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: true,
    disabled: isLocked || uploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-200 ${
          isLocked || uploading
            ? "bg-slate-50 border-slate-100 cursor-not-allowed"
            : isDragActive
              ? "border-blue-500 bg-blue-50 scale-[1.02]"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 cursor-pointer"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">
          {uploading
            ? "⏳"
            : currentFileIds.length > 0
              ? "📄"
              : isDragActive
                ? "📥"
                : "☁️"}
        </div>

        <p className="text-sm font-bold text-slate-700 text-center">
          {uploading
            ? "Uploading..."
            : currentFileIds.length > 0
              ? `${currentFileIds.length} file${currentFileIds.length !== 1 ? "s" : ""} uploaded`
              : "Drag & Drop files"}
        </p>

        <p className="text-xs text-slate-400 mt-1">
          {uploading
            ? "Please wait..."
            : currentFileIds.length > 0
              ? "Click to add more files"
              : `or click to browse · ${ACCEPTED_LABEL}`}
        </p>

        {isLocked && (
          <div className="mt-2 text-[10px] font-black uppercase tracking-tighter text-slate-300">
            Complete previous step to unlock
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-xs font-semibold text-red-700 whitespace-pre-line">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="shrink-0 text-xs font-black leading-none text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
