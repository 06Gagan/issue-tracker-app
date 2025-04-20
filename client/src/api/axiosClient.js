// Setup for making API calls to the backend
import axios from 'axios';

// Backend API URL - adjust as needed
const API_BASE_URL = 'http://localhost:5001/api';

// Create an Axios instance with base configuration
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- API Functions ---

// Generic error handler for API calls
const handleApiError = (error, context) => {
  console.error(`Error ${context}:`, error.response?.data || error.message);
  throw error.response?.data || error;
};

// Fetch all issues
export const fetchIssues = async () => {
  try {
    const response = await axiosClient.get('/issues');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching issues');
  }
};

// Fetch a single issue by ID
export const getIssueById = async (id) => {
  try {
    const response = await axiosClient.get(`/issues/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error, `fetching issue ${id}`);
  }
};

// Create a new issue
export const createIssue = async (issueData) => {
  try {
    const response = await axiosClient.post('/issues', issueData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'creating issue');
  }
};

// Update an existing issue
export const updateIssue = async (id, updateData) => {
  try {
    const response = await axiosClient.put(`/issues/${id}`, updateData);
    return response.data;
  } catch (error) {
    handleApiError(error, `updating issue ${id}`);
  }
};

// Delete an issue
export const deleteIssue = async (id) => {
  try {
    const response = await axiosClient.delete(`/issues/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error, `deleting issue ${id}`);
  }
};

export default axiosClient;