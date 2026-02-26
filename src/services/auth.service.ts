import api from './api';

export const authService = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    requestOtp: async (email: string) => {
        const response = await api.post('/auth/otp/request', { email });
        return response.data;
    },

    verifyOtp: async (data: { email: string; otp: string }) => {
        const response = await api.post('/auth/otp/verify', data);
        return response.data;
    },

    createAdmin: async (data: any) => {
        const response = await api.post('/auth/admin/signup', data);
        return response.data;
    },

    signup: async (data: { name: string; email: string; password: string; phone?: string; role: string }) => {
        const response = await api.post('/auth/signup', data);
        return response.data;
    },
};

