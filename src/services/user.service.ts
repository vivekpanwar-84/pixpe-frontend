import api from './api';

export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.patch('/users/profile', data);
        return response.data;
    },

    submitKyc: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/users/kyc', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
