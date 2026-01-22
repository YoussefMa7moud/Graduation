import axios from 'axios';

export interface SubmitToCompanyRequest {
    proposalId: number;
    softwareCompanyId: number;
}

// Use an absolute URL to bypass Vite proxy issues if possible, 
// or ensure the path is exactly what the backend expects.

export const sendProposalToCompany = async (submissionData: SubmitToCompanyRequest) => {
    const token = localStorage.getItem('auth_token');

    try {
        const response = await axios.post('/api/submissions/send-to-company', submissionData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            // Ensure credentials are sent if your backend uses sessions/cookies
            withCredentials: true 
        });
        return response.data;
    } catch (error: any) {
        // If you get a 403 here, it's definitely the Backend Security Filter
        console.error("403 Forbidden - The backend rejected the token or the request path.");
        throw error;
    }



    
};