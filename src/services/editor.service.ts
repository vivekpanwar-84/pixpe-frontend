import api from './api';

export const editorService = {
    getAssignedAois: async (hasForms?: boolean, page: number = 1, limit: number = 20, search?: string) => {
        const response = await api.get('/aoi/assigned', { params: { hasForms, page, limit, search } });
        return response.data;
    },

    getAoiById: async (id: string) => {
        const response = await api.get(`/aoi/assigned/${id}`);
        return response.data;
    },
    getAoiStats: async (id: string) => {
        const response = await api.get(`/aoi/${id}/stats`);
        return response.data;
    },

    getAssignedPhotos: async (page: number = 1, limit: number = 20, search?: string) => {
        const response = await api.get('/photos/assigned', { params: { page, limit, search } });
        return response.data;
    },

    getAssignedPhotoById: async (id: string) => {
        const response = await api.get(`/photos/assigned/${id}`);
        return response.data;
    },
    getPhotosByAoiAndEditor: async (aoiId: string, editorId: string) => {
        const response = await api.get(`/photos/aoi/${aoiId}/editor/${editorId}`);
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
    getForms: async (aoiId?: string, submittedBy?: string, photoId?: string, page: number = 1, limit: number = 20, search?: string) => {
        const response = await api.get('/forms', {
            params: {
                aoi_id: aoiId,
                submitted_by: submittedBy,
                photo_id: photoId,
                page,
                limit,
                search
            }
        });
        return response.data;
    },
};
