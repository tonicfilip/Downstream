const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export interface Case {
  id: number;
  title: string;
  description?: string;
  steps: Step[];
}

export interface Step {
  id: number;
  case_id: number;
  title: string;
  content: string;
  fileId: string | null;
  isCompleted: boolean;
}

export const api = {
  async getAllCases(): Promise<{ cases: Case[] }> {
    const response = await fetch(`${API_BASE_URL}/case/`);
    if (!response.ok) throw new Error("Failed to fetch cases");
    return response.json();
  },

  async getCaseById(id: number): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/${id}`);
    if (!response.ok) throw new Error("Failed to fetch case");
    return response.json();
  },

  async createCase(title: string, description?: string): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!response.ok) throw new Error("Failed to create case");
    return response.json();
  },

  async createStep(caseId: number, title: string): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/${caseId}/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error("Failed to create step");
    return response.json();
  },

  async updateCase(caseId: number, description: string): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/${caseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    if (!response.ok) throw new Error("Failed to update case");
    return response.json();
  },

  async updateStep(caseId: number, stepId: number, content: string): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/${caseId}/step/${stepId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error("Failed to update step");
    return response.json();
  },

  async uploadFile(caseId: number, stepId: number, file: File): Promise<Case> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/case/${caseId}/step/${stepId}/file`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to upload file");
    return response.json();
  },

  getFileUrl(caseId: number, stepId: number, filename: string): string {
    return `${API_BASE_URL}/case/${caseId}/step/${stepId}/file/${filename}`;
  },

  async deleteCase(caseId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/case/${caseId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete case");
  },

  async deleteStep(caseId: number, stepId: number): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/${caseId}/step/${stepId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete step");
    return response.json();
  },

  async deleteFile(caseId: number, stepId: number, filename: string): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/${caseId}/step/${stepId}/file/${filename}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete file");
    return response.json();
  },

  async renameStep(caseId: number, stepId: number, title: string): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/${caseId}/step/${stepId}/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error("Failed to rename step");
    return response.json();
  },

  async reorderSteps(caseId: number, stepIds: number[]): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/${caseId}/steps/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step_ids: stepIds }),
    });
    if (!response.ok) throw new Error("Failed to reorder steps");
    return response.json();
  },
};
