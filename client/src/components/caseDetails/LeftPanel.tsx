import React from "react";
import { useNavigate } from "react-router-dom";
import type { Case } from "../../types";

interface LeftPanelProps {
  currentCase: Case;
  activeStepIndex: number;
  setActiveStepIndex: (index: number) => void;
  onDeleteCase: () => void;
  onDeleteStep: (stepId: number) => void;
  onRenameStep: (stepId: number, newTitle: string) => void;
  onMoveStep: (stepId: number, direction: "up" | "down") => void;
  onAddStep: () => void;
  showAddStep: boolean;
  setShowAddStep: (show: boolean) => void;
  stepTitle: string;
  setStepTitle: (title: string) => void;
  editingStepTitle: number | null;
  setEditingStepTitle: (id: number | null) => void;
  editedStepTitle: string;
  setEditedStepTitle: (title: string) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  currentCase,
  activeStepIndex,
  setActiveStepIndex,
  onDeleteCase,
  onDeleteStep,
  onRenameStep,
  onMoveStep,
  onAddStep,
  showAddStep,
  setShowAddStep,
  stepTitle,
  setStepTitle,
  editingStepTitle,
  setEditingStepTitle,
  editedStepTitle,
  setEditedStepTitle,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <button
            onClick={() => navigate("/")}
            className="text-xs font-bold text-blue-600 uppercase mb-2 block"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-start gap-2">
            <h2 className="text-xl font-black text-slate-800 truncate">
              {currentCase.title}
            </h2>
            <button
              onClick={onDeleteCase}
              className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-lg font-bold flex-shrink-0"
              title="Delete case"
            >
              ×
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {currentCase.steps.map((step, index) => {
            const isLocked =
              index > 0 && !currentCase.steps[index - 1].isCompleted;
            const isActive = index === activeStepIndex;
            const isEditing = editingStepTitle === step.id;

            return (
              <div key={step.id} className="space-y-1">
                {isEditing ? (
                  <div className="flex gap-2 px-4 py-2">
                    <input
                      type="text"
                      value={editedStepTitle}
                      onChange={(e) => setEditedStepTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          onRenameStep(step.id, editedStepTitle);
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => onRenameStep(step.id, editedStepTitle)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingStepTitle(null)}
                      className="px-2 py-1 bg-slate-300 rounded text-xs font-bold hover:bg-slate-400"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={isLocked}
                    onClick={() => setActiveStepIndex(index)}
                    onDoubleClick={() => {
                      setEditingStepTitle(step.id);
                      setEditedStepTitle(step.title);
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-lg"
                        : isLocked
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive ? "bg-blue-500" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {step.isCompleted ? "✓" : index + 1}
                    </div>
                    <span className="text-sm font-semibold truncate">
                      {step.title}
                    </span>
                    {isLocked && <span className="ml-auto text-xs">🔒</span>}
                    {isActive && (
                      <>
                        <a
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteStep(step.id);
                          }}
                          className="ml-auto text-red-400 hover:text-red-300 font-bold text-lg"
                          title="Delete step"
                        >
                          ×
                        </a>
                      </>
                    )}
                  </button>
                )}
                {isActive && !isEditing && (
                  <div className="flex gap-2 px-4">
                    <button
                      onClick={() => onMoveStep(step.id, "up")}
                      disabled={index === 0}
                      className="flex-1 px-2 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition"
                      title="Move step up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => onMoveStep(step.id, "down")}
                      disabled={index === currentCase.steps.length - 1}
                      className="flex-1 px-2 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition"
                      title="Move step down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => {
                        setEditingStepTitle(step.id);
                        setEditedStepTitle(step.title);
                      }}
                      className="flex-1 px-2 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 rounded transition"
                      title="Rename step"
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <button
          onClick={() => setShowAddStep(true)}
          className="mx-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition w-full"
        >
          + Add Step
        </button>
      </aside>

      {showAddStep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4 text-slate-900">
              New Step
            </h3>
            <input
              type="text"
              placeholder="Step title"
              value={stepTitle}
              onChange={(e) => setStepTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onAddStep()}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={onAddStep}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowAddStep(false);
                  setStepTitle("");
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
