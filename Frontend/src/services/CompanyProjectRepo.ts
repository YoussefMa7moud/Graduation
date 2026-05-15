import api from "./api";

export interface CompanyProjectDTO {
  id: number;
  contractRecordId: number;
  contractName: string;
  projectManagerId: number;
  projectManagerName: string;
  ndaSigned: boolean;
  proposalId: number;
  projectTitle: string;
  projectDescription?: string;
  projectType?: string;
  mainFeatures?: string;
  budgetUsd?: number;
  durationDays?: number;
  clientName?: string;
  oclRules: string;
  guidelines: string;
  status: string;
  createdAt: string;
}

export interface AssignProjectRequest {
  contractRecordId: number;
  projectManagerId: number;
  oclRules: string;
  guidelines: string;
}

export const assignProjectToPM = async (request: AssignProjectRequest): Promise<CompanyProjectDTO> => {
  const response = await api.post<CompanyProjectDTO>("/api/company-projects/assign", request);
  return response.data;
};

export const getCompanyProjects = async (): Promise<CompanyProjectDTO[]> => {
  const response = await api.get<CompanyProjectDTO[]>("/api/company-projects/company");
  return response.data;
};

export const getPMProjects = async (): Promise<CompanyProjectDTO[]> => {
  const response = await api.get<CompanyProjectDTO[]>("/api/company-projects/pm");
  return response.data;
};

export const getProjectById = async (id: number): Promise<CompanyProjectDTO> => {
  const response = await api.get<CompanyProjectDTO>(`/api/company-projects/${id}`);
  return response.data;
};
