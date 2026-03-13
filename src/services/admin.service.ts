import api from './api';

export const adminService = {
    /**
     * Create a new user (Admin/Manager only)
     * @param data { email, password, name, role }
     */
    createUser: async (data: any) => {
        const response = await api.post('/users', data);
        return response.data;
    },

    getAllUsers: async (role?: string, page: number = 1, limit: number = 20, search?: string) => {
        const response = await api.get('/users', { params: { role, page, limit, search } });
        return response.data;
    },

    /**
     * Get specific user details
     */
    getUserDetails: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    /**
     * Update user details
     */
    updateUser: async (id: string, data: any) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    /**
     * Update user status (isActive)
     */
    updateUserStatus: async (id: string, isActive: boolean) => {
        const response = await api.patch(`/users/${id}/status`, { isActive });
        return response.data;
    },

    /**
     * Delete a user
     */
    deleteUser: async (id: string) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    /**
     * KYC Management
     */
    getKycPending: async () => {
        const response = await api.get('/users/kyc-pending');
        return response.data;
    },

    updateKycStatus: async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
        const response = await api.patch(`/users/${id}/kyc-status`, { status, reason });
        return response.data;
    },

    /**
     * System Settings
     */
    getSystemSettings: async () => {
        const response = await api.get('/system/settings');
        return response.data;
    },

    updateSystemSettings: async (data: { key: string; value: string; description?: string }) => {
        const response = await api.patch('/system/settings', data);
        return response.data;
    },

    /**
     * Dashboard Statistics
     */
    getStats: async () => {
        const response = await api.get('/rewards/stats');
        return response.data;
    }
};
