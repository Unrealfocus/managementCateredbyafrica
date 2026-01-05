import axios from 'axios';

// Helper function to create an Axios instance
export const apiInstance = ({ isToken = false } = {}) => {
    const instance = axios.create({
        baseURL: 'https://caterply.com',
    });

    // Request interceptor to add Bearer token if needed
    instance.interceptors.request.use((config) => {
        if (isToken) {
            const token = typeof window !== 'undefined'
                ? localStorage.getItem('cateredbyafrica_marketing_admin_key')
                : null;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    });

    return instance;
};

export const handleRequest = async (axiosPromise) => {
    try {
        const response = await axiosPromise;
        return response.data.data;
    } catch (error) {
        const message = error.response?.data?.message
            || error.message
            || 'Request Failed';
        const status = error.response ? error.response.status : 500;
        throw { status, message };
    }
};