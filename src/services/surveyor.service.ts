import api from './api';

export const surveyorService = {
    // AOIs
    getAssignedAois: async () => {
        const response = await api.get('/aoi/assigned');
        return response.data;
    },

    getAssignedAoiById: async (id: string) => {
        const response = await api.get(`/aoi/assigned/${id}`);
        return response.data;
    },

    startAoi: async (id: string) => {
        const response = await api.patch(`/aoi/${id}/start`);
        return response.data;
    },

    submitAoi: async (id: string) => {
        const response = await api.patch(`/aoi/${id}/submit`);
        return response.data;
    },

    // Photos
    uploadPhoto: async (formData: FormData) => {
        const response = await api.post('/photos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMyUploads: async () => {
        const response = await api.get('/photos/my-uploads');
        return response.data;
    },

    deletePhoto: async (id: string) => {
        const response = await api.delete(`/photos/${id}`);
        return response.data;
    },

    resubmitPhoto: async (id: string) => {
        const response = await api.patch(`/photos/${id}/resubmit`);
        return response.data;
    },

    // Rewards & Earnings
    getEarnings: async () => {
        const response = await api.get('/rewards/my-earnings');
        return response.data;
    },

    requestPayout: async (data: {
        aoi_id: string;
        total_photos_submitted: number;
        total_photos_approved: number;
        request_notes?: string;
    }) => {
        const response = await api.post('/rewards/request', data);
        return response.data;
    },
};
