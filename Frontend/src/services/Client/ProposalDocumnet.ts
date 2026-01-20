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