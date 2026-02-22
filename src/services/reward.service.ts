import api from './api';

export const rewardService = {
    /**
     * Get all reward requests (Admin/Manager only)
     * @param status optional status filter
     */
    getAllRewardRequests: async (status?: string) => {
        const response = await api.get('/rewards', { params: { status } });
        return response.data;
    },

    /**
     * Update reward request status (Approve/Reject/Pay)
     * @param id reward request ID
     * @param data { status, review_notes, bonus_amount, payment_method, payment_reference }
     */
    updateRewardStatus: async (id: string, data: any) => {
        const response = await api.patch(`/rewards/${id}/status`, data);
        return response.data;
    },

    /**
     * Get system-wide reward stats
     */
    getStats: async () => {
        const response = await api.get('/rewards/stats');
        return response.data;
    }
};
