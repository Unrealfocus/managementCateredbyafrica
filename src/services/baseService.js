// src/services/baseService.js
import { apiInstance } from '../config/base.api';

export const createAPI = () => {
    const api = apiInstance({ isToken: true });

    return {
        async get(endpoint, params = {}) {
            try {
                const query = params.search ? `?search=${encodeURIComponent(params.search)}` : '';
                const url = `${endpoint}${query}`;
                const response = await api.get(url);
                return response.data.data; // Adjust based on your handleRequest logic
            } catch (error) {
                const message = error.response?.data?.message || error.message || 'Request Failed';
                throw new Error(message);
            }
        },

        async post(endpoint, body = {}) {
            try {
                const response = await api.post(endpoint, body);
                return response.data.data;
            } catch (error) {
                const message = error.response?.data?.message || error.message || 'Request Failed';
                throw new Error(message);
            }
        },

        async put(endpoint, body = {}) {
            try {
                const response = await api.put(endpoint, body);
                return response.data.data;
            } catch (error) {
                const message = error.response?.data?.message || error.message || 'Request Failed';
                throw new Error(message);
            }
        },

        async delete(endpoint, params = {}) {
            try {
                const query = params.search ? `?search=${encodeURIComponent(params.search)}` : '';
                const url = `${endpoint}${query}`;
                const response = await api.delete(url);
                return response.data.data;
            } catch (error) {
                const message = error.response?.data?.message || error.message || 'Request Failed';
                throw new Error(message);
            }
        },
    };
};