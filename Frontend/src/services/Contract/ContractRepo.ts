import axios from 'axios';

// --- Helper for Auth Headers ---
const getAuthHeaders = (isJson = true) => {
    const token = localStorage.getItem('auth_token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            ...(isJson && { 'Content-Type': 'application/json' })
        },
        withCredentials: true
    };
};

// --- Interfaces ---

export interface SubmissionResponseDTO {
    id: number;
    status: string;
    proposalId: number;
    companyId: number;
    updatedAt: string;
    proposedAt: string;
    proposalTitle: string;
    projectType: string;
    problemSolved: string;
    content: string;
    mainFeatures: string;
    userRoles: string;
    scalability: string;
    durationDays: number;
    budgetUsd: number;
    ndaRequired: boolean;
    codeOwnership: string;
    maintenancePeriod: string;
    clientType: string;
    clientName: string;
    clientCompanyName?: string;
}

// ── Updated: added contractHash and projectTitle ──────────────────────────────
export interface ContractRecordResponse {
    id: number;
    submissionId: number;
    contractType: string;
    fileName: string;
    signedAt: string;
    createdAt: string;
    isAssigned: boolean;
    assignedPmName?: string;
    projectTitle?: string;
    contractHash?: string | null;  // 64-char hex SHA-256 hash, null for legacy records
}

// ── New: response from the verify endpoint ────────────────────────────────────
export interface ContractVerifyResponse {
    verified: boolean;
    status: 'VERIFIED' | 'TAMPERED' | 'NO_HASH' | 'NOT_FOUND';
    storedHash: string | null;
    message: string;
}

// --- Service Functions ---

export const getCompanyQueue = async (): Promise<SubmissionResponseDTO[]> => {
    try {
        const response = await axios.get<SubmissionResponseDTO[]>(
            '/api/submissions/company-queue',
            getAuthHeaders()
        );
        return response.data;
    } catch (error: any) {
        console.error("Error fetching company queue:", error.response || error);
        throw error;
    }
};

export const getContractRecords = async (): Promise<ContractRecordResponse[]> => {
    try {
        const response = await axios.get<ContractRecordResponse[]>(
            '/api/contracts/records',
            getAuthHeaders()
        );
        return response.data;
    } catch (error: any) {
        console.error("Error fetching contract records:", error.response || error);
        throw error;
    }
};

export const downloadContractPdf = async (recordId: number, fileName: string) => {
    try {
        const response = await axios.get(`/api/contracts/records/${recordId}/pdf`, {
            ...getAuthHeaders(false),
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error: any) {
        console.error("Error downloading PDF:", error.response || error);
        throw error;
    }
};

/**
 * Verify contract integrity by re-computing the hash server-side
 * and comparing it to the hash stored at signing time.
 *
 * GET /api/contracts/records/{id}/verify
 *
 * Returns:
 *   { verified: true,  status: "VERIFIED",  storedHash: "a3f9...", message: "..." }
 *   { verified: false, status: "TAMPERED",  storedHash: "a3f9...", message: "..." }
 *   { verified: false, status: "NO_HASH",   storedHash: null,      message: "..." }
 */
export const revealContractPassword = async (
    recordId: number,
    email: string,
    password: string
): Promise<string> => {
    const response = await axios.post<{ contractPassword: string }>(
        `/api/contracts/records/${recordId}/reveal-password`,
        { email, password },
        getAuthHeaders()
    );
    return response.data.contractPassword;
};

export const verifyContract = async (recordId: number): Promise<ContractVerifyResponse> => {
    try {
        const response = await axios.get<ContractVerifyResponse>(
            `/api/contracts/records/${recordId}/verify`,
            getAuthHeaders(false)
        );
        return response.data;
    } catch (error: any) {
        console.error("Error verifying contract:", error.response || error);
        throw error;
    }
};