import axios from 'axios';

// --- Interfaces based on your Backend DTOs ---

export interface SubmissionResponseDTO {
    id: number;
    status: string;
    proposalId: number;
    companyId: number;
    updatedAt: string;
    proposedAt: string;
    // Project Details
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
    // Client Details
    clientType: string;
    clientName: string;
    clientCompanyName?: string;
}

export interface ContractRecordResponse {
    id: number;
    submissionId: number;
    contractType: string;
    fileName: string;
    signedAt: string;
    createdAt: string;
}

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

// --- Service Functions ---

/**
 * 1. Retrieve the Company's Project Queue
 * Maps to: @GetMapping("/company-queue")
 */
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

/**
 * 2. Retrieve Signed Contract Records
 * Maps to: @GetMapping("/records")
 */
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

/**
 * 3. Retrieve a Contract PDF as a Blob
 * Maps to: @GetMapping("/records/{id}/pdf")
 */
export const downloadContractPdf = async (recordId: number, fileName: string) => {
    try {
        const response = await axios.get(`/api/contracts/records/${recordId}/pdf`, {
            ...getAuthHeaders(false),
            responseType: 'blob' // Critical for byte[] streams
        });

        // Create a download link for the PDF blob
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return true;
    } catch (error: any) {
        console.error("Error downloading PDF:", error.response || error);
        throw error;
    }
};