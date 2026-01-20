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