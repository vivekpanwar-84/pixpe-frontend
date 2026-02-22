import api from './api';

export const managerService = {
    // AOI Management
    getAllAois: async () => {
        const response = await api.get('/aoi');
        return response.data;
    },

    assignAoi: async (id: string, surveyorId: string) => {
        const response = await api.patch(`/aoi/${id}/assign`, { surveyor_id: surveyorId });
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

    // POI Management
    getAllPois: async () => {
        const response = await api.get('/poi');
        return response.data;
    },

    verifyPoi: async (id: string, data: any) => {
        const response = await api.patch(`/poi/${id}/verify`, data);
        return response.data;
    },

    assignPoi: async (id: string, editorId: string) => {
        const response = await api.patch(`/poi/${id}/assign`, { editor_id: editorId });
        return response.data;
    },

    // Photos & Forms Review
    getAllPhotos: async (status?: string) => {
        const response = await api.get('/photos', { params: { status } });
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

    getAllForms: async (status?: string) => {
        const response = await api.get('/forms', { params: { status } });
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
};
