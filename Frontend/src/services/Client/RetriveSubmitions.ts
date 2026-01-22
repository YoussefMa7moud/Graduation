import axios from 'axios';

export const getMyActiveSubmissions = async () => {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get('/api/submissions/my-submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};