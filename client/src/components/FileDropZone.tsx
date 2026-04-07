import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "../api";

interface FileDropZoneProps {
  currentFileId: string | null;
  onFileAccepted: (fileName: string) => void;
  caseId: number;
  stepId: number;
  isLocked?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  currentFileId,
  onFileAccepted,
  caseId,
  stepId,
  isLocked = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isLocked || uploading) return;

      const file = acceptedFiles[0];
      if (file && file.type === "application/pdf") {
        setUploading(true);
        try {
          await api.uploadFile(caseId, stepId, file);
          onFileAccepted(file.name);
        } catch (err) {
          console.error("Failed to upload file:", err);
        } finally {
          setUploading(false);
        }
      }
    },
    [onFileAccepted, caseId, stepId, isLocked, uploading],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: isLocked || uploading,
  });

  return (
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
        {uploading ? "⏳" : currentFileId ? "📄" : isDragActive ? "📥" : "☁️"}
      </div>

      <p className="text-sm font-bold text-slate-700 text-center">
        {uploading
          ? "Uploading..."
          : currentFileId
            ? `File: ${currentFileId}`
            : "Drag & Drop PDF"}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        {uploading
          ? "Please wait..."
          : currentFileId
            ? "Click to replace file"
            : "or click to browse local files"}
      </p>

      {isLocked && (
        <div className="mt-2 text-[10px] font-black uppercase tracking-tighter text-slate-300">
          Complete previous step to unlock
        </div>
      )}
    </div>
  );
};
