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
  fileIds: string[] | null;
  isCompleted: boolean;
}

/**
 * Error thrown by the API client. Carries the HTTP `status` (when the failure
 * came from a response) and, when available, the human-readable message the
 * server returned in its `{ "error": ... }` body.
 */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, options?: { status?: number; cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "ApiError";
    this.status = options?.status;
  }

  /** Build an ApiError from a non-OK response, preferring the server's message. */
  static async fromResponse(response: Response, fallback: string): Promise<ApiError> {
    let message = fallback;
    try {
      const data: unknown = await response.json();
      if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        if (typeof record.error === "string") message = record.error;
        else if (typeof record.message === "string") message = record.message;
      }
    } catch {
      // Body wasn't JSON (e.g. an HTML error page or empty 500); keep the fallback.
    }
    return new ApiError(message, { status: response.status });
  }
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

  async updateStep(caseId: number, stepId: number, content: string, isCompleted?: boolean): Promise<Case> {
    const response = await fetch(`${API_BASE_URL}/case/${caseId}/step/${stepId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, isCompleted }),
    });
    if (!response.ok) throw new Error("Failed to update step");
    return response.json();
  },

  async uploadFile(caseId: number, stepId: number, file: File): Promise<Case> {
    const formData = new FormData();
    formData.append("file", file);

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/case/${caseId}/step/${stepId}/file`, {
        method: "POST",
        body: formData,
      });
    } catch (cause) {
      // fetch only rejects on network-level failures (offline, DNS, CORS).
      throw new ApiError("Network error — could not reach the server.", { cause });
    }

    if (!response.ok) throw await ApiError.fromResponse(response, "Failed to upload file");
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
