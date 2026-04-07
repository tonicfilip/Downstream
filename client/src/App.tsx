import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CaseList from "./pages/CaseList";
import CaseDetail from "./pages/CaseDetail";
import type { Case } from "./types";
import { api } from "./api";

function App() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const data = await api.getAllCases();
        setCases(data.cases as unknown as Case[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch cases");
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const addCase = async (newCase: Case) => {
    try {
      const created = await api.createCase(newCase.title);
      setCases((prev) => [...prev, created as unknown as Case]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case");
    }
  };

  const deleteCase = (caseId: number) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-slate-500">Loading cases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-slate-900">
        <Routes>
          <Route
            path="/"
            element={
              <CaseList
                cases={cases}
                onAddCase={addCase}
                onDeleteCase={deleteCase}
              />
            }
          />
          <Route
            path="/case/:caseId"
            element={<CaseDetail cases={cases} setCases={setCases} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
