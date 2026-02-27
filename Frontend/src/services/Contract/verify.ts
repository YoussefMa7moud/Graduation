import axios from 'axios';

const PUBLIC_API_URL = 'http://localhost:8080/api/public';

export interface SignatureVerificationDTO {
  submissionId: number;
  contractTitle: string;
  clientName: string;
  clientSignatoryName: string;
  clientSignedAt: string;
  clientSignatureBase64: string;
  companyName: string;
  companySignatoryName: string;
  companySignedAt: string;
  companySignatureBase64: string;
}

export const verifySignature = async (submissionId: number, type: string | null): Promise<SignatureVerificationDTO> => {
  const url = type ? `${PUBLIC_API_URL}/signature-verification/${submissionId}?type=${type}` : `${PUBLIC_API_URL}/signature-verification/${submissionId}`;
  const response = await axios.get(url);
  return response.data;
};
