import axios from 'axios';

const getAuthHeaders = (json = false) => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) headers['Content-Type'] = 'application/json';
  return { headers };
};

export interface NdaParty {
  name: string;
  signatory: string;
  title: string;
  email: string;
  details: string;
}

export interface NdaPartiesResponse {
  partyA: NdaParty;
  partyB: NdaParty;
  actor: 'client' | 'company';
}

export const getNdaParties = async (submissionId: number): Promise<NdaPartiesResponse> => {
  const { data } = await axios.get<NdaPartiesResponse>(
    `/api/submissions/${submissionId}/nda-parties`,
    getAuthHeaders()
  );
  return data;
};

export interface NdaDraftResponse {
  id?: number;
  submissionId: number;
  clientSignedAt?: string;
  companySignedAt?: string;
  contractPayloadJson?: string;
  clientSigned: boolean;
  companySigned: boolean;
}

export const getNdaDraft = async (submissionId: number): Promise<NdaDraftResponse> => {
  const { data } = await axios.get<NdaDraftResponse>(
    `/api/contracts/nda/draft?submissionId=${submissionId}`,
    getAuthHeaders()
  );
  return data;
};

export interface ContractRecordResponse {
  id: number;
  submissionId: number;
  contractType: string;
  fileName: string;
  signedAt: string;
  createdAt: string;
}

export const getContractRecords = async (): Promise<ContractRecordResponse[]> => {
  const { data } = await axios.get<ContractRecordResponse[]>(`/api/contracts/records`, getAuthHeaders());
  return data;
};

export interface NdaSignRequest {
  submissionId: number;
  signatureBase64: string;
  contractPayloadJson: string;
}

export const signClient = async (req: NdaSignRequest): Promise<NdaDraftResponse> => {
  const { data } = await axios.post<NdaDraftResponse>(
    '/api/contracts/nda/sign/client',
    req,
    getAuthHeaders(true)
  );
  return data;
};

export const signCompany = async (req: NdaSignRequest): Promise<NdaDraftResponse> => {
  const { data } = await axios.post<NdaDraftResponse>(
    '/api/contracts/nda/sign/company',
    req,
    getAuthHeaders(true)
  );
  return data;
};
