import api from './api';

export const surveyorService = {
    // AOIs
    getAssignedAois: async (page: number = 1, limit: number = 50, search?: string) => {
        const response = await api.get('/aoi/assigned', { params: { page, limit, search } });
        return response.data;
    },

    getAllAois: async (unassigned?: boolean, limit: number = 20, search?: string) => {
        const response = await api.get('/aoi', { params: { unassigned, limit, search } });
        return response.data;
    },

    getMyStats: async () => {
        const response = await api.get('/aoi/my-stats');
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

    getMyUploads: async (aoiId?: string, page: number = 1, limit: number = 20, search?: string) => {
        const response = await api.get('/photos/my-uploads', { params: { aoi_id: aoiId, page, limit, search } });
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

    getSubmittableAois: async () => {
        const response = await api.get('/rewards/submittable-aois');
        return response.data;
    },

    getMyBalance: async () => {
        const response = await api.get('/rewards/balance');
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

    requestAoi: async (data: { aoi_id: string; request_notes?: string; request_type?: 'ASSIGNMENT' | 'REOPEN' }) => {
        const response = await api.post('/aoi-requests', data);
        return response.data;
    },

    getMyAoiRequests: async () => {
        const response = await api.get('/aoi-requests/my-requests');
        return response.data;
    },
};
