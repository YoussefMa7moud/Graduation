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
  projectDescription: string;
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
  const token = localStorage.getItem("auth_token");
  const response = await axios.post("/api/company-projects/assign", request, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getCompanyProjects = async (): Promise<CompanyProjectDTO[]> => {
  const token = localStorage.getItem("auth_token");
  const response = await axios.get("/api/company-projects/company", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getPMProjects = async (): Promise<CompanyProjectDTO[]> => {
  const token = localStorage.getItem("auth_token");
  const response = await axios.get("/api/company-projects/pm", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
