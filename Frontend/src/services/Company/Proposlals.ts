import axios from 'axios';

const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});

export const submissionService = {
    getCompanyQueue: async () => {
        const response = await axios.get('/api/submissions/company-queue', getHeaders());
        return response.data; // This returns the ARRAY directly
    },

    updateStatus: async (id: number, status: string, note?: string) => {
        return axios.patch(`/api/submissions/${id}/status`, null, {
            ...getHeaders(),
            params: { status, note }
        });
    },

    deleteSubmission: async (id: number) => {
        return axios.delete(`/api/submissions/${id}`, getHeaders());
    }
};