// API Configuration for Lab Login System
// This file handles different API URLs for development and production

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper function to construct full API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// API client with environment-aware URLs
export const apiClient = {
  async fetch(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    return response;
  },

  async get(endpoint, options = {}) {
    return this.fetch(endpoint, { method: 'GET', ...options });
  },

  async post(endpoint, data, options = {}) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  },

  async put(endpoint, data, options = {}) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  },

  async delete(endpoint, options = {}) {
    return this.fetch(endpoint, { method: 'DELETE', ...options });
  },
};

// Export API base URL for direct use
export { API_BASE_URL };

// Development helper
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    environment: import.meta.env.MODE,
  });
}