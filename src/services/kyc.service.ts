import api from './api';

export interface KYCSubmission {
    full_name: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    state?: string;
    pin_code?: string;
    document_type: 'AADHAAR' | 'PAN' | 'DRIVING_LICENSE' | 'VOTER_ID';
    document_number: string;
    document_front_url?: string;
    document_back_url?: string;
    selfie_url?: string;
    bank_account_number?: string;
    ifsc_code?: string;
    bank_proof_url?: string;
}

export const kycService = {
    submitKYC: async (data: KYCSubmission) => {
        const response = await api.post('/surveyor/kyc', data);
        return response.data;
    },

    getKYCStatus: async () => {
        try {
            const response = await api.get('/surveyor/kyc/status');
            return response.data;
        } catch (error: any) {
            // If KYC record doesn't exist yet, return PENDING status
            if (error.response?.status === 404) {
                return { status: 'PENDING' };
            }
            throw error;
        }
    },

    uploadKycDocument: async (file: File, type: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        const response = await api.post('/surveyor/kyc/upload', formData);
        return response.data;
    }
};
