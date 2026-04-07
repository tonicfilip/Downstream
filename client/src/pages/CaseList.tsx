import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Case } from "../types";
import { NewCaseModal } from "../components/Modal";
import { api } from "../api";

interface Props {
  cases: Case[];
  onAddCase: (newCase: Case) => void;
  onDeleteCase: (caseId: number) => void;
}

const CaseList: React.FC<Props> = ({ cases, onAddCase, onDeleteCase }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteCase = async (caseId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this case? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      setDeletingId(caseId);
      await api.deleteCase(caseId);
      onDeleteCase(caseId);
    } catch (error) {
      alert(
        "Failed to delete case: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Case Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            Manage and track sequential case progress.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm"
        >
          + New Case
        </button>
      </header>

      {cases.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-white">
          <p className="text-slate-400 text-lg">
            No cases found. Start by creating one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => {
            const completedSteps = c.steps.filter((s) => s.isCompleted).length;
            const totalSteps = c.steps.length;
            const progressPercentage = (completedSteps / totalSteps) * 100;

            return (
              <div
                key={c.id}
                className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {c.title}
                  </h2>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                    {c.id}
                  </span>
                </div>

                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 font-medium">Progress</span>
                    <span className="text-slate-900 font-bold">
                      {completedSteps} / {totalSteps} Steps
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/case/${c.id}`}
                    className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-colors"
                  >
                    Open Case
                  </Link>
                  <button
                    onClick={() => handleDeleteCase(c.id)}
                    disabled={deletingId === c.id}
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-semibold transition-colors"
                    title="Delete case"
                  >
                    {deletingId === c.id ? "..." : "×"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <NewCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddCase}
      />
    </div>
  );
};

export default CaseList;
