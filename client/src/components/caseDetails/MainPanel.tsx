import React from "react";
import type { Case, Step } from "../../types";
import { FileDropZone } from "../FileDropZone";

interface MainPanelProps {
  activeStep: Step;
  activeStepIndex: number;
  currentCase: Case;
  onSaveStepContent: () => void;
  onToggleStepCompletion: (isCompleted: boolean) => void;
  onFileAccepted: (fileIds: string[]) => void;
  updateActiveStep: (updates: Partial<Step>) => void;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  activeStep,
  activeStepIndex,
  currentCase,
  onSaveStepContent,
  onToggleStepCompletion,
  onFileAccepted,
  updateActiveStep,
}) => {
  return (
    <main className="flex-1 flex flex-col overflow-y-auto">
      <div className="p-12 max-w-2xl mx-auto w-full">
        <div className="mb-10">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
            Step {activeStepIndex + 1} of {currentCase.steps.length}
          </span>
          <h1 className="text-4xl font-black text-slate-900 mt-2">
            {activeStep ? activeStep.title : " "}
          </h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Detailed Content
          </label>
          <textarea
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-44 outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-4"
            placeholder="Describe the outcome of this step..."
            value={activeStep.content}
            onChange={(e) => updateActiveStep({ content: e.target.value })}
          />
          <button
            onClick={onSaveStepContent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 mb-8"
          >
            Save Content
          </button>

          <label className="block text-sm font-bold text-slate-700 mb-2">
            Upload Required File
          </label>
          <FileDropZone
            currentFileIds={activeStep.fileIds || []}
            caseId={currentCase.id}
            stepId={activeStep.id}
            isLocked={
              activeStepIndex > 0 &&
              !currentCase.steps[activeStepIndex - 1].isCompleted
            }
            onFileAccepted={onFileAccepted}
          />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-8">
            <span className="font-bold text-slate-700">
              Mark as completed
            </span>
            <input
              type="checkbox"
              className="w-6 h-6 accent-blue-600 cursor-pointer"
              checked={activeStep.isCompleted}
              onChange={(e) => {
                updateActiveStep({ isCompleted: e.target.checked });
                onToggleStepCompletion(e.target.checked);
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
};
