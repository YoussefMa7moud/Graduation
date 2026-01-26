import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.config';

export const getAllCompanies = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.CLIENT.BROWSECOMPANIES);

        console.log("RAW BACKEND RESPONSE:", response.data);

        if (Array.isArray(response.data)) {
            return response.data;
        }

        if (response.data && Array.isArray(response.data.content)) {
            return response.data.content;
        }

        return [];
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
};

export const getDashboardStats = async () => {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('/api/company/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return null;
    }
};

export const registerProjectManager = async (data: any) => {
    const token = localStorage.getItem('auth_token');

    // We need to pass companyUserId. 
    // Assuming backend extracts company from the logged-in user, but endpoint asks for companyUserId.
    // If the endpoint uses @RequestParam for companyUserId, we must send it.
    // However, the backend logic: "Company company = companyRepo.findByUser_Id(companyUserId)"
    // implies we need the ID of the company ADMIN user.
    // We can get this from local storage or decode token if available. 
    // For now, let's assume the user ID is stored.
    const userId = localStorage.getItem('user_id');

    const formData = new FormData();
    // formData.append('companyUserId', userId || '0'); // Backend now extracts from token
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('password', data.password);

    return axios.post('/api/auth/register-pm', formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getProjectManagers = async () => {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('/api/company/pms', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Get PMs Error:", error);
        return [];
    }
};

export const updateProjectManager = async (pmId: number, data: any) => {
    const token = localStorage.getItem('auth_token');
    return axios.put(`/api/company/pms/${pmId}`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

export const deleteProjectManager = async (pmId: number) => {
    const token = localStorage.getItem('auth_token');
    return axios.delete(`/api/company/pms/${pmId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
};