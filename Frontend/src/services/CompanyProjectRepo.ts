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
  projectSummary?: string;
  technicalDocumentJson?: string;
  technicalDocumentValidationJson?: string;
  status: string;
  createdAt: string;
}

export interface ClauseOclConstraint {
  clauseId: string;
  sectionTitle: string;
  clauseText: string;
  oclCode: string;
  explanation: string;
}

export interface ExtractClauseOclResponse {
  constraints: ClauseOclConstraint[];
  oclRulesJson: string;
}

export interface AssignProjectRequest {
  contractRecordId: number;
  projectManagerId: number;
  oclRules: string;
  guidelines: string;
}

export const extractClauseOclFromContract = async (
  contractRecordId: number
): Promise<ExtractClauseOclResponse> => {
  const response = await api.post<ExtractClauseOclResponse>(
    `/api/company-projects/contracts/${contractRecordId}/extract-clause-ocl`,
    {},
    { timeout: 300000, skipAuthRedirect: true }
  );
  return response.data;
};

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

export interface GenerateGuidelinesResponse {
  message: string;
  projectSummary: string;
  guidelines: string;
}

export const generateProjectGuidelines = async (
  projectId: number
): Promise<GenerateGuidelinesResponse> => {
  const response = await api.post<GenerateGuidelinesResponse>(
    `/api/company-projects/${projectId}/generate-guidelines`,
    {},
    { timeout: 120000, skipAuthRedirect: true }
  );
  return response.data;
};

export interface TechDocViolation {
  clauseId?: string;
  constraintName: string;
  oclCode?: string;
  oclExplanation?: string;
  whyViolated: string;
  documentConflict?: string;
}

export interface TechDocValidationResponse {
  valid: boolean;
  violations: TechDocViolation[];
}

export const saveTechnicalDocumentToServer = async (
  projectId: number,
  documentFieldsJson: string
): Promise<void> => {
  await api.put(`/api/company-projects/${projectId}/technical-document`, {
    documentFieldsJson,
  });
};

export const validateTechnicalDocument = async (
  projectId: number,
  documentText: string,
  documentFieldsJson?: string
): Promise<TechDocValidationResponse> => {
  const response = await api.post<TechDocValidationResponse>(
    `/api/company-projects/${projectId}/validate-tech-doc`,
    { documentText, documentFieldsJson },
    { timeout: 600000, skipAuthRedirect: true }
  );
  return response.data;
};
