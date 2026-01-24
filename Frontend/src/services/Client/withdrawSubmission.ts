import axios from 'axios';

const API_URL = '/api/submissions';

/**
 * Helper to retrieve the token and format headers
 */
const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
});

/**
 * Withdraws a submission by deleting it from the database.
 * Now includes Authorization headers to match backend requirements.
 */
export const withdrawSubmission = async (submissionId: number) => {
  try {
    // You must pass getHeaders() as the second argument for DELETE requests
    const response = await axios.delete(`${API_URL}/${submissionId}`, getHeaders());
    return response.data;
  } catch (error) {
    console.error("Error withdrawing submission:", error);
    throw error;
  }
};