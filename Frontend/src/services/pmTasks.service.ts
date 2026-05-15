import api from './api';

export type ProjectPhase =
  | 'PLANNING'
  | 'DESIGN'
  | 'DEVELOPMENT'
  | 'TESTING'
  | 'DEPLOYMENT'
  | 'MAINTENANCE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'DONE';

export interface ProjectTaskDTO {
  id: number;
  companyProjectId: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  estimatedDuration?: string;
  suggestedAssignee?: string;
  status: TaskStatus;
  dependencies: string[];
  milestone?: string;
  phase: ProjectPhase;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateTasksFromProposalRequest {
  proposalText: string;
  replaceExisting?: boolean;
}

export interface GenerateTasksResponse {
  message: string;
  count: number;
  tasks: ProjectTaskDTO[];
}

/** Task APIs must not trigger global logout on 401/403 — show errors in the Tasks UI instead. */
const taskRequestConfig = { skipAuthRedirect: true as const };

export const getProjectTasks = async (projectId: number): Promise<ProjectTaskDTO[]> => {
  const { data } = await api.get<ProjectTaskDTO[]>(
    `/api/company-projects/${projectId}/tasks`,
    taskRequestConfig
  );
  return data;
};

export const generateTasksFromProposal = async (
  projectId: number,
  request: GenerateTasksFromProposalRequest
): Promise<GenerateTasksResponse> => {
  const { data } = await api.post<GenerateTasksResponse>(
    `/api/company-projects/${projectId}/tasks/generate-from-proposal`,
    { proposalText: request.proposalText, replaceExisting: request.replaceExisting ?? true },
    { timeout: 180000, ...taskRequestConfig }
  );
  return data;
};

export const updateProjectTask = async (
  projectId: number,
  taskId: number,
  status: TaskStatus
): Promise<ProjectTaskDTO> => {
  const { data } = await api.patch<ProjectTaskDTO>(
    `/api/company-projects/${projectId}/tasks/${taskId}`,
    { status },
    taskRequestConfig
  );
  return data;
};

export const deleteProjectTask = async (projectId: number, taskId: number): Promise<void> => {
  await api.delete(`/api/company-projects/${projectId}/tasks/${taskId}`, taskRequestConfig);
};

export const PHASE_LABELS: Record<ProjectPhase, string> = {
  PLANNING: 'Planning',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  TESTING: 'Testing',
  DEPLOYMENT: 'Deployment',
  MAINTENANCE: 'Maintenance',
};

export const PHASE_ORDER: ProjectPhase[] = [
  'PLANNING',
  'DESIGN',
  'DEVELOPMENT',
  'TESTING',
  'DEPLOYMENT',
  'MAINTENANCE',
];
