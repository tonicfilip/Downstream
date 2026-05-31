import React from "react";
import type { Case, Step } from "../../types";
import { api } from "../../api";

interface RightPanelProps {
  currentCase: Case;
  allFiles: { step: Step; fileKey: string }[];
  onDeleteFile: (fileKey: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  currentCase,
  allFiles,
  onDeleteFile,
}) => {
  const extractFileName = (fileKey: string): string => {
    const parts = fileKey.split("/");
    const lastPart = parts[parts.length - 1];
    const match = lastPart.match(/_(.+)$/);
    return match ? match[1] : lastPart;
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Case Files
        </h3>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto">
        {allFiles.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-10">
            No files uploaded yet.
          </p>
        ) : (
          allFiles.map(({ step, fileKey }) => (
            <div
              key={fileKey}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-blue-50 hover:border-blue-300 transition group"
            >
              <a
                href={api.getFileUrl(currentCase.id, step.id, fileKey)}
                download
                className="flex items-center gap-3 flex-1 overflow-hidden"
              >
                <div className="text-xl">📄</div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase truncate">
                    {step.title}
                  </p>
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {extractFileName(fileKey)}
                  </p>
                </div>
                <div className="text-slate-400">↓</div>
              </a>
              <button
                onClick={() => onDeleteFile(fileKey)}
                className="text-red-600 hover:text-red-700 font-bold text-lg flex-shrink-0 opacity-0 group-hover:opacity-100 transition"
                title="Delete file"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
