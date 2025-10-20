import axios from 'axios';

// Base API URL - can be configured via environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.response?.status === 404) {
      throw new Error('API endpoint not found.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
);

// API Functions

/**
 * Solve a math problem
 * @param {string} problemText - The math problem text
 * @param {string} problemType - Type of problem (optional)
 * @param {string} sessionId - Session ID (optional)
 * @returns {Promise<Object>} Solution data
 */
export const solveMathProblem = async (problemText, problemType = 'other', sessionId = null) => {
  try {
    const response = await api.post('/solve/', {
      problem_text: problemText,
      problem_type: problemType,
      session_id: sessionId,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error solving math problem:', error);
    throw error;
  }
};

/**
 * Process OCR for handwritten math problems
 * @param {File} imageFile - The image file to process
 * @param {string} sessionId - Session ID (optional)
 * @returns {Promise<Object>} OCR result with extracted text
 */
export const processOCR = async (imageFile, sessionId = null) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }
    
    const response = await api.post('/ocr/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error processing OCR:', error);
    throw error;
  }
};

/**
 * Send chat message to AI assistant
 * @param {string} message - User message
 * @param {string} sessionId - Session ID (optional)
 * @param {number} problemId - Problem ID (optional)
 * @returns {Promise<Object>} AI response
 */
export const sendChatMessage = async (message, sessionId = null, problemId = null) => {
  try {
    const response = await api.post('/chat/', {
      message,
      session_id: sessionId,
      problem_id: problemId,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Generate graph data for an equation
 * @param {string} equation - Mathematical equation
 * @param {string} graphType - Type of graph (2D or 3D)
 * @returns {Promise<Object>} Graph data
 */
export const generateGraph = async (equation, graphType = '2D') => {
  try {
    const response = await api.post('/graph/', {
      equation,
      type: graphType,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating graph:', error);
    throw error;
  }
};

/**
 * Export solution in specified format
 * @param {number} problemId - Problem ID to export
 * @param {string} exportType - Export format (pdf, text, image, latex)
 * @param {string} sessionId - Session ID (optional)
 * @returns {Promise<Object>} Export data
 */
export const exportSolution = async (problemId, exportType, sessionId = null) => {
  try {
    const response = await api.post('/export/', {
      problem_id: problemId,
      export_type: exportType,
      session_id: sessionId,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting solution:', error);
    throw error;
  }
};

/**
 * Get sample problems
 * @returns {Promise<Object>} Sample problems data
 */
export const getSampleProblems = async () => {
  try {
    const response = await api.get('/sample-problems/');
    return response.data;
  } catch (error) {
    console.error('Error getting sample problems:', error);
    throw error;
  }
};

/**
 * Health check for API
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health-check/');
    return response.data;
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
};

/**
 * Generate session ID
 * @returns {string} Unique session ID
 */
export const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Download file from blob data
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename for download
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error Response:', error.response.data);
    console.error('API Error Status:', error.response.status);
    
    // Handle specific error cases
    if (error.response.status === 400) {
      const data = error.response.data;
      if (data.problem_text) {
        return 'Please enter a valid math problem.';
      } else if (data.problem_type) {
        return 'Invalid problem type selected.';
      } else if (data.session_id) {
        return 'Session error. Please refresh the page.';
      } else {
        return `Invalid input: ${JSON.stringify(data)}`;
      }
    }
    
    return error.response.data.message || `Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};

export default api;
