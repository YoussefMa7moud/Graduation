import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.config';

export const getAllCompanies = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.CLIENT.BROWSECOMPANIES);
        
        // ADD THIS LOG: Open your browser console (F12) to see this output
        console.log("RAW BACKEND RESPONSE:", response.data);

        // Check for common Spring Data structures
        if (Array.isArray(response.data)) {
            return response.data;
        } 
        
        // If you are using Pageable in Spring, the data is inside 'content'
        if (response.data && Array.isArray(response.data.content)) {
            return response.data.content;
        }

        return []; 
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
};