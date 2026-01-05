import { apiInstance, handleRequest } from '../config/base.api';

const loginService = async (email, password) => {
    const api = apiInstance({ isToken: false });

    try {
        const data = await handleRequest(
            api.post('/api/login', { email, password })
        );
        if (data.access_token) {
            localStorage.setItem('cateredbyafrica_marketing_admin_key', data.access_token);
        }

        return data;
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};
export default loginService