import { apiInstance, handleRequest } from '../config/base.api';

export const getDashboard = async () => {
    const api = apiInstance({ isToken: true });
    try {
        const data = await handleRequest(
            api.get('/api/dashboard')
        );
        return data;
    } catch (error) {
        throw error;
    }
};