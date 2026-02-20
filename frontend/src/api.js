import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api"; // ✅ Change to your Laravel URL

export const api = {
  async post(endpoint, data, token = null) {
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, { headers });
    return response.data;
  },

  async get(endpoint, token = null) {
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};
    const response = await axios.get(`${BASE_URL}${endpoint}`, { headers });
    return response.data;
  },

  async put(endpoint, data, token = null) {
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};
    const response = await axios.put(`${BASE_URL}${endpoint}`, data, { headers });
    return response.data;
  },
};