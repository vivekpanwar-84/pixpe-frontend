import api from './api';

export const notificationService = {
    getMyNotifications: async () => {
        const response = await api.get('/system/notifications/my');
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await api.post(`/system/notifications/${id}/read`);
        return response.data;
    },
};
