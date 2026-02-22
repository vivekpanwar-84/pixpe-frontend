import api from './api';

export const editorService = {
    getAssignedPois: async () => {
        const response = await api.get('/poi/assigned');
        return response.data;
    },

    getAssignedPhotos: async () => {
        const response = await api.get('/photos/assigned');
        return response.data;
    },

    getAssignedPhotoById: async (id: string) => {
        const response = await api.get(`/photos/assigned/${id}`);
        return response.data;
    },

    submitForm: async (data: any) => {
        const response = await api.post('/forms', data);
        return response.data;
    },

    requestReupload: async (id: string, reason: string) => {
        const response = await api.patch(`/photos/${id}/request-reupload`, { reason });
        return response.data;
    },
};
