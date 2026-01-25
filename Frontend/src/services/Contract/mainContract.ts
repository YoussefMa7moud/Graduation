import axios from 'axios';

const getAuthHeaders = (json = false) => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) headers['Content-Type'] = 'application/json';
  return { headers };
};

export interface ContractParty {
  name: string;
  signatory: string;
  title: string;
  email: string;
  details: string;
}

export interface ContractPartiesResponse {
  partyA: ContractParty;
  partyB: ContractParty;
  actor: 'client' | 'company';
  clientType: 'INDIVIDUAL' | 'COMPANY';
}

export const getContractParties = async (submissionId: number): Promise<ContractPartiesResponse> => {
  const { data } = await axios.get<ContractPartiesResponse>(
    `/api/contracts/main/parties?submissionId=${submissionId}`,
    getAuthHeaders()
  );
  return data;
};

export interface ContractDraftResponse {
  id?: number;
  submissionId: number;
  contractPayloadJson?: string;
  aiValidated?: boolean;
  oclValidated?: boolean;
  sentToClient?: boolean;
  clientSignedAt?: string;
  companySignedAt?: string;
  validationResultsJson?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getContractDraft = async (submissionId: number): Promise<ContractDraftResponse> => {
  const { data } = await axios.get<ContractDraftResponse>(
    `/api/contracts/main/draft?submissionId=${submissionId}`,
    getAuthHeaders()
  );
  return data;
};

export interface SaveContractDraftRequest {
  submissionId: number;
  contractPayloadJson: string;
}

export const saveContractDraft = async (request: SaveContractDraftRequest): Promise<ContractDraftResponse> => {
  const { data } = await axios.post<ContractDraftResponse>(
    '/api/contracts/main/draft/save',
    request,
    getAuthHeaders(true)
  );
  return data;
};

export interface ViolationDTO {
  clauseId: string;
  clauseText: string;
  violatedLaw: Record<string, string>;
  confidence: number;
  reason: string;
  suggestion: string;
}

export interface ContractValidationResponse {
  isValid: boolean;
  complianceScore: number;
  violations: ViolationDTO[];
  message: string;
}

export const validateWithAI = async (submissionId: number): Promise<ContractValidationResponse> => {
  const { data } = await axios.post<ContractValidationResponse>(
    `/api/contracts/main/validate/ai?submissionId=${submissionId}`,
    null,
    getAuthHeaders()
  );
  return data;
};

export const validateWithOCL = async (submissionId: number): Promise<ContractValidationResponse> => {
  const { data } = await axios.post<ContractValidationResponse>(
    `/api/contracts/main/validate/ocl?submissionId=${submissionId}`,
    null,
    getAuthHeaders()
  );
  return data;
};

export const sendToClient = async (submissionId: number): Promise<ContractDraftResponse> => {
  const { data } = await axios.post<ContractDraftResponse>(
    `/api/contracts/main/send-to-client?submissionId=${submissionId}`,
    null,
    getAuthHeaders()
  );
  return data;
};

export interface ContractSignRequest {
  submissionId: number;
  signatureBase64: string;
  contractPayloadJson: string;
}

export const signClient = async (request: ContractSignRequest): Promise<ContractDraftResponse> => {
  const { data } = await axios.post<ContractDraftResponse>(
    '/api/contracts/main/sign/client',
    request,
    getAuthHeaders(true)
  );
  return data;
};

export const signCompany = async (request: ContractSignRequest): Promise<ContractDraftResponse> => {
  const { data } = await axios.post<ContractDraftResponse>(
    '/api/contracts/main/sign/company',
    request,
    getAuthHeaders(true)
  );
  return data;
};

export interface ContractChatMessageDTO {
  id: number;
  submissionId: number;
  senderId: number;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SendChatMessageRequest {
  submissionId: number;
  message: string;
}

export const sendChatMessage = async (request: SendChatMessageRequest): Promise<ContractChatMessageDTO> => {
  const { data } = await axios.post<ContractChatMessageDTO>(
    '/api/contracts/main/chat/send',
    request,
    getAuthHeaders(true)
  );
  return data;
};

export const getChatMessages = async (submissionId: number): Promise<ContractChatMessageDTO[]> => {
  const { data } = await axios.get<ContractChatMessageDTO[]>(
    `/api/contracts/main/chat/messages?submissionId=${submissionId}`,
    getAuthHeaders()
  );
  return data;
};
