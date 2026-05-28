export interface Step {
    id: number;
    case_id: number;
    title: string;
    fileIds: string[] | null;
    content: string;
    isCompleted: boolean;
    order: number;
}

export interface Case {
    id: number;
    title: string;
    description?: string;
    steps: Step[];
}