import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "../api";

interface FileDropZoneProps {
  currentFileIds: string[];
  onFileAccepted: (fileIds: string[]) => void;
  caseId: number;
  stepId: number;
  isLocked?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  currentFileIds,
  onFileAccepted,
  caseId,
  stepId,
  isLocked = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isLocked || uploading) return;

      for (const file of acceptedFiles) {
        if (file.type === "application/pdf") {
          setUploading(true);
          try {
            const response = await api.uploadFile(caseId, stepId, file);
            const caseData = response as unknown as { steps: Array<{ id: number; fileIds: string[] | null }> };
            const updatedStep = caseData.steps.find((s) => s.id === stepId);
            if (updatedStep && updatedStep.fileIds) {
              onFileAccepted(updatedStep.fileIds);
            }
          } catch (err) {
            console.error("Failed to upload file:", err);
          } finally {
            setUploading(false);
          }
        }
      }
    },
    [onFileAccepted, caseId, stepId, isLocked, uploading],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
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
        {uploading ? "⏳" : currentFileIds.length > 0 ? "📄" : isDragActive ? "📥" : "☁️"}
      </div>

      <p className="text-sm font-bold text-slate-700 text-center">
        {uploading
          ? "Uploading..."
          : currentFileIds.length > 0
            ? `${currentFileIds.length} file${currentFileIds.length !== 1 ? "s" : ""} uploaded`
            : "Drag & Drop PDF"}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        {uploading
          ? "Please wait..."
          : currentFileIds.length > 0
            ? "Click to add more files"
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
