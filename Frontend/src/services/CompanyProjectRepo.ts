import axios from "axios";

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

const authHeader = () => {
  const token = localStorage.getItem("auth_token");
  return { Authorization: `Bearer ${token}` };
};

export const assignProjectToPM = async (request: AssignProjectRequest): Promise<CompanyProjectDTO> => {
  const response = await axios.post("/api/company-projects/assign", request, {
    headers: authHeader()
  });
  return response.data;
};

export const getCompanyProjects = async (): Promise<CompanyProjectDTO[]> => {
  const response = await axios.get("/api/company-projects/company", { headers: authHeader() });
  return response.data;
};

export const getPMProjects = async (): Promise<CompanyProjectDTO[]> => {
  const response = await axios.get("/api/company-projects/pm", { headers: authHeader() });
  return response.data;
};

export const getProjectById = async (id: number): Promise<CompanyProjectDTO> => {
  const response = await axios.get(`/api/company-projects/${id}`, { headers: authHeader() });
  return response.data;
};
