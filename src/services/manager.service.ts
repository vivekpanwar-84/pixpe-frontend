import api from './api';

export const managerService = {
    // AOI Management
    getAllAois: async () => {
        const response = await api.get('/aoi');
        return response.data;
    },

    assignAoi: async (id: string, data: { surveyor_id?: string; editor_id?: string }) => {
        const response = await api.patch(`/aoi/${id}/assign`, data);
        return response.data;
    },

    bulkAssignAoi: async (data: { aoi_ids: string[]; surveyor_id?: string; editor_id?: string }) => {
        const response = await api.patch('/aoi/bulk-assign', data);
        return response.data;
    },

    createAoi: async (data: any) => {
        const response = await api.post('/aoi', data);
        return response.data;
    },

    updateAoi: async (id: string, data: any) => {
        const response = await api.patch(`/aoi/${id}`, data);
        return response.data;
    },

    closeAoi: async (id: string) => {
        const response = await api.patch(`/aoi/${id}/close`);
        return response.data;
    },

    // Photos & Forms Review
    getAllPhotos: async (status?: string, aoiId?: string) => {
        const response = await api.get('/photos', { params: { status, aoi_id: aoiId } });
        return response.data;
    },

    assignPhoto: async (id: string, editorId: string) => {
        const response = await api.patch(`/photos/${id}/assign`, { editor_id: editorId });
        return response.data;
    },

    updatePhotoStatus: async (id: string, data: any) => {
        const response = await api.patch(`/photos/${id}/status`, data);
        return response.data;
    },

    getAllForms: async (status?: string, photoId?: string, aoiId?: string) => {
        const response = await api.get('/forms', { params: { status, photo_id: photoId, aoi_id: aoiId } });
        return response.data;
    },

    updateFormStatus: async (id: string, data: any) => {
        const response = await api.patch(`/forms/${id}/status`, data);
        return response.data;
    },

    // KYC Management
    getKycPending: async () => {
        const response = await api.get('/users/kyc-pending');
        return response.data;
    },

    updateKycStatus: async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
        const response = await api.patch(`/users/${id}/kyc-status`, { status, reason });
        return response.data;
    },

    // AOI Requests
    getPendingAoiRequests: async () => {
        const response = await api.get('/aoi-requests/pending');
        return response.data;
    },

    respondToAoiRequest: async (id: string, data: { status: 'APPROVED' | 'REJECTED'; manager_notes?: string }) => {
        const response = await api.patch(`/aoi-requests/${id}/respond`, data);
        return response.data;
    },
};
