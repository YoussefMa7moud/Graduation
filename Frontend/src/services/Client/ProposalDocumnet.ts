import axios from 'axios';

export const SubmitProposal = async (proposalData: any) => {
    // 1. Get the token
    const token = localStorage.getItem('auth_token'); 

    // DEBUG: Check if token exists in the console
    if (!token) {
        console.error("NO TOKEN FOUND IN LOCAL STORAGE! Redirecting to login might be needed.");
    } else {
        console.log("Token found, length:", token.length);
    }

    try {
        const response = await axios.post('/api/proposals/create', proposalData, {
            headers: {
                // IMPORTANT: Space after 'Bearer' is mandatory
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error: any) {
        // If this logs 401, the backend didn't like the token or the route is protected
        console.error("Submission failed. Status:", error.response?.status);
        console.error("Error details:", error.response?.data);
        throw error;
    }
};




export const GetAllProposals = async (userId: number | string) => {
    const token = localStorage.getItem('auth_token');
    
    try {
        // This targets: http://localhost:8080/api/proposals/MyProposals/1
        const response = await axios.get(`/api/proposals/MyProposals/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error("Fetching proposals failed. Status:", error.response?.status);
        throw error;
    }
};


export const DeleteProposal = async (proposalId: number | string) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await axios.delete(`/api/proposals/delete/${proposalId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error("Deleting proposal failed. Status:", error.response?.status);
        throw error;
    }
};