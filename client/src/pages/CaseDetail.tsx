import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Case, Step } from "../types";
import { FileDropZone } from "../components/FileDropZone";
import { api } from "../api";

interface Props {
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
}

const CaseDetail: React.FC<Props> = ({ cases, setCases }) => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepTitle, setStepTitle] = useState("");
  const [showAddStep, setShowAddStep] = useState(false);
  const [editingCaseDesc, setEditingCaseDesc] = useState(false);
  const [editingStepTitle, setEditingStepTitle] = useState<number | null>(null);
  const [editedStepTitle, setEditedStepTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState(
    currentCase?.description || "",
  );

  const handleDeleteCase = async () => {
    if (!currentCase) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this case? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await api.deleteCase(currentCase.id);
      setCases((prev) => prev.filter((c) => c.id !== currentCase.id));
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete case");
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!currentCase) return;
    if (!window.confirm("Are you sure you want to delete this step?")) {
      return;
    }
    try {
      const updated = await api.deleteStep(currentCase.id, stepId);
      setCurrentCase(updated as unknown as Case);
      setCases((prev) =>
        prev.map((c) =>
          c.id === currentCase.id ? (updated as unknown as Case) : c,
        ),
      );
      setActiveStepIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete step");
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!currentCase || !activeStep) return;
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }
    try {
      const updated = await api.deleteFile(
        currentCase.id,
        activeStep.id,
        fileName,
      );
      setCurrentCase(updated as unknown as Case);
      setCases((prev) =>
        prev.map((c) =>
          c.id === currentCase.id ? (updated as unknown as Case) : c,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  const handleRenameStep = async (stepId: number, newTitle: string) => {
    if (!currentCase || !newTitle.trim()) return;
    try {
      const updated = await api.renameStep(currentCase.id, stepId, newTitle);
      setCurrentCase(updated as unknown as Case);
      setCases((prev) =>
        prev.map((c) =>
          c.id === currentCase.id ? (updated as unknown as Case) : c,
        ),
      );
      setEditingStepTitle(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename step");
    }
  };

  const handleMoveStep = async (stepId: number, direction: "up" | "down") => {
    if (!currentCase) return;
    const currentIndex = currentCase.steps.findIndex((s) => s.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= currentCase.steps.length) return;

    const newStepOrder = [...currentCase.steps];
    [newStepOrder[currentIndex], newStepOrder[newIndex]] = [
      newStepOrder[newIndex],
      newStepOrder[currentIndex],
    ];

    try {
      const updated = await api.reorderSteps(
        currentCase.id,
        newStepOrder.map((s) => s.id),
      );
      setCurrentCase(updated as unknown as Case);
      setCases((prev) =>
        prev.map((c) =>
          c.id === currentCase.id ? (updated as unknown as Case) : c,
        ),
      );
      setActiveStepIndex(newIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder steps");
    }
  };

  const handleAddStep = async () => {
    if (!stepTitle.trim() || !currentCase) return;
    try {
      const updated = await api.createStep(currentCase.id, stepTitle);
      setCurrentCase(updated as unknown as Case);
      setCases((prev) =>
        prev.map((c) =>
          c.id === currentCase.id ? (updated as unknown as Case) : c,
        ),
      );
      setStepTitle("");
      setShowAddStep(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add step");
    }
  };

  const handleSaveStepContent = async () => {
    if (!currentCase || !activeStep) return;
    try {
      const updated = await api.updateStep(
        currentCase.id,
        activeStep.id,
        activeStep.content,
      );
      setCurrentCase(updated as unknown as Case);
      setCases((prev) =>
        prev.map((c) =>
          c.id === currentCase.id ? (updated as unknown as Case) : c,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save step content",
      );
    }
  };

  const handleToggleStepCompletion = async (isCompleted: boolean) => {
    if (!currentCase || !activeStep) return;
    try {
      const updated = await api.updateStep(
        currentCase.id,
        activeStep.id,
        activeStep.content,
        isCompleted,
      );
      setCurrentCase(updated as unknown as Case);
      setCases((prev) =>
        prev.map((c) =>
          c.id === currentCase.id ? (updated as unknown as Case) : c,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update step completion",
      );
    }
  };

  const handleSaveCaseDescription = async () => {
    if (!currentCase) return;
    try {
      const updated = await api.updateCase(currentCase.id, caseDescription);
      setCurrentCase(updated as unknown as Case);
      setCaseDescription(updated.description || "");
      setCases((prev) =>
        prev.map((c) =>
          c.id === currentCase.id ? (updated as unknown as Case) : c,
        ),
      );
      setEditingCaseDesc(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save case description",
      );
    }
  };

  useEffect(() => {
    const fetchCase = async () => {
      if (!caseId) return;
      try {
        setLoading(true);
        const data = await api.getCaseById(parseInt(caseId));
        setCurrentCase(data as unknown as Case);
        setCaseDescription(data.description || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch case");
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [caseId]);

  if (loading) {
    return <div className="p-10 text-center">Loading case...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  if (!currentCase) {
    return <div className="p-10 text-center">Case not found.</div>;
  }

  if (currentCase.steps.length === 0) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
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
                onClick={handleDeleteCase}
                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-lg font-bold flex-shrink-0"
                title="Delete case"
              >
                ×
              </button>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <p className="text-center text-slate-400 text-sm">No steps yet.</p>
          </nav>
          <button
            onClick={() => setShowAddStep(true)}
            className="mx-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add Step
          </button>
        </aside>
        <main className="flex-1 flex items-center justify-center">
          {showAddStep ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
              <h3 className="text-lg font-bold mb-4 text-slate-900">
                New Step
              </h3>
              <input
                type="text"
                placeholder="Step title"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddStep()}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddStep}
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
          ) : (
            <div className="text-center">
              <p className="text-slate-500 text-lg">
                This case has no steps yet.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Add steps to get started.
              </p>
            </div>
          )}
        </main>
        <aside className="w-80 bg-white border-l border-slate-200" />
      </div>
    );
  }

  const activeStep = currentCase.steps[activeStepIndex];
  const allFiles = currentCase.steps.filter((s) => s.fileId);

  const updateActiveStep = (updates: Partial<Step>) => {
    const updated = {
      ...currentCase,
      steps: currentCase.steps.map((s, idx) =>
        idx === activeStepIndex ? { ...s, ...updates } : s,
      ),
    };
    setCurrentCase(updated);
    setCases((prev) =>
      prev.map((c) => (c.id === currentCase.id ? updated : c)),
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 1. LEFT PANEL: Step Navigation */}
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
              onClick={handleDeleteCase}
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
                          handleRenameStep(step.id, editedStepTitle);
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameStep(step.id, editedStepTitle)}
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
                            handleDeleteStep(step.id);
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
                      onClick={() => handleMoveStep(step.id, "up")}
                      disabled={index === 0}
                      className="flex-1 px-2 py-1 text-xs font-bold bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition"
                      title="Move step up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveStep(step.id, "down")}
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

      {/* 2. CENTER PANEL: Active Step Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
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
                onKeyPress={(e) => e.key === "Enter" && handleAddStep()}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddStep}
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
              onClick={handleSaveStepContent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 mb-8"
            >
              Save Content
            </button>

            <label className="block text-sm font-bold text-slate-700 mb-2">
              Upload Required File
            </label>
            <FileDropZone
              currentFileId={activeStep.fileId || null}
              caseId={currentCase.id}
              stepId={activeStep.id}
              isLocked={
                activeStepIndex > 0 &&
                !currentCase.steps[activeStepIndex - 1].isCompleted
              }
              onFileAccepted={(fileName) => {
                updateActiveStep({ fileId: fileName });
                setCurrentCase((prev) =>
                  prev
                    ? {
                        ...prev,
                        steps: prev.steps.map((s) =>
                          s.id === activeStep.id
                            ? { ...s, fileId: fileName }
                            : s,
                        ),
                      }
                    : null,
                );
              }}
            />

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700">
                Mark as completed
              </span>
              <input
                type="checkbox"
                className="w-6 h-6 accent-blue-600 cursor-pointer"
                checked={activeStep.isCompleted}
                onChange={(e) => {
                  updateActiveStep({ isCompleted: e.target.checked });
                  handleToggleStepCompletion(e.target.checked);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 3. RIGHT PANEL: File Summary */}
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
            allFiles.map((f) => (
              <div
                key={f.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 hover:bg-blue-50 hover:border-blue-300 transition group"
              >
                <a
                  href={api.getFileUrl(currentCase.id, f.id, f.fileId || "")}
                  download
                  className="flex items-center gap-3 flex-1 overflow-hidden"
                >
                  <div className="text-xl">📄</div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase truncate">
                      {f.title}
                    </p>
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {f.fileId}
                    </p>
                  </div>
                  <div className="text-slate-400">↓</div>
                </a>
                <button
                  onClick={() => handleDeleteFile(f.fileId || "")}
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
    </div>
  );
};

export default CaseDetail;
