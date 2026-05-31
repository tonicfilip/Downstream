import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Case, Step } from "../types";
import { api } from "../api";
import { LeftPanel } from "../components/caseDetails/LeftPanel";
import { MainPanel } from "../components/caseDetails/MainPanel";
import { RightPanel } from "../components/caseDetails/RightPanel";

interface Props {
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
}

const CaseDetail: React.FC<Props> = ({ setCases }) => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepTitle, setStepTitle] = useState("");
  const [showAddStep, setShowAddStep] = useState(false);
  const [editingStepTitle, setEditingStepTitle] = useState<number | null>(null);
  const [editedStepTitle, setEditedStepTitle] = useState("");

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

  const handleDeleteFile = async (fileKey: string) => {
    if (!currentCase) return;
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }
    try {
      const updated = await api.deleteFile(currentCase.id, 0, fileKey);
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

  useEffect(() => {
    const fetchCase = async () => {
      if (!caseId) return;
      try {
        setLoading(true);
        const data = await api.getCaseById(parseInt(caseId));
        setCurrentCase(data as unknown as Case);
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

  const allFiles = currentCase.steps.flatMap((step) =>
    (step.fileIds || []).map((fileKey) => ({ step, fileKey })),
  );

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

  const handleFileAccepted = (fileIds: string[]) => {
    updateActiveStep({ fileIds });
    setCurrentCase((prev) =>
      prev
        ? {
            ...prev,
            steps: prev.steps.map((s) =>
              s.id === activeStep.id ? { ...s, fileIds } : s,
            ),
          }
        : null,
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <LeftPanel
        currentCase={currentCase}
        activeStepIndex={activeStepIndex}
        setActiveStepIndex={setActiveStepIndex}
        onDeleteCase={handleDeleteCase}
        onDeleteStep={handleDeleteStep}
        onRenameStep={handleRenameStep}
        onMoveStep={handleMoveStep}
        onAddStep={handleAddStep}
        showAddStep={showAddStep}
        setShowAddStep={setShowAddStep}
        stepTitle={stepTitle}
        setStepTitle={setStepTitle}
        editingStepTitle={editingStepTitle}
        setEditingStepTitle={setEditingStepTitle}
        editedStepTitle={editedStepTitle}
        setEditedStepTitle={setEditedStepTitle}
      />

      <MainPanel
        activeStep={activeStep}
        activeStepIndex={activeStepIndex}
        currentCase={currentCase}
        onSaveStepContent={handleSaveStepContent}
        onToggleStepCompletion={handleToggleStepCompletion}
        onFileAccepted={handleFileAccepted}
        updateActiveStep={updateActiveStep}
      />

      <RightPanel
        currentCase={currentCase}
        allFiles={allFiles}
        onDeleteFile={handleDeleteFile}
      />
    </div>
  );
};

export default CaseDetail;
