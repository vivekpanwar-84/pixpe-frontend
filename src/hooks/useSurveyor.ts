import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { surveyorService } from '@/services/surveyor.service';

export const useSurveyor = () => {
    const queryClient = useQueryClient();

    const useAssignedAois = (page: number = 1, limit: number = 20, search: string = '') => {
        return useQuery({
            queryKey: ['aois', 'assigned', { page, limit, search }],
            queryFn: () => surveyorService.getAssignedAois(page, limit, search),
            placeholderData: keepPreviousData,
        });
    };

    const useAssignedAoiDetail = (id: string) => {
        return useQuery({
            queryKey: ['aois', 'assigned', id],
            queryFn: () => surveyorService.getAssignedAoiById(id),
            enabled: !!id,
        });
    };

    const useMyUploads = (aoiId?: string, page: number = 1, limit: number = 50, search: string = '') => {
        return useQuery({
            queryKey: ['photos', 'my-uploads', aoiId, { page, limit, search }],
            queryFn: () => surveyorService.getMyUploads(aoiId, page, limit, search),
        });
    };

    const startAoiMutation = useMutation({
        mutationFn: surveyorService.startAoi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aois', 'assigned'] });
        },
    });

    const submitAoiMutation = useMutation({
        mutationFn: surveyorService.submitAoi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aois', 'assigned'] });
        },
    });

    const uploadPhotoMutation = useMutation({
        mutationFn: surveyorService.uploadPhoto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos', 'my-uploads'] });
        }
    });

    const deletePhotoMutation = useMutation({
        mutationFn: surveyorService.deletePhoto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos', 'my-uploads'] });
        }
    });

    const resubmitPhotoMutation = useMutation({
        mutationFn: surveyorService.resubmitPhoto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos', 'my-uploads'] });
        }
    });

    const requestAoiMutation = useMutation({
        mutationFn: surveyorService.requestAoi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aoi-requests'] });
        }
    });

    return {
        useAssignedAois,
        useAssignedAoiDetail,
        useMyUploads,
        startAoi: startAoiMutation,
        submitAoi: submitAoiMutation,
        uploadPhoto: uploadPhotoMutation,
        deletePhoto: deletePhotoMutation,
        resubmitPhoto: resubmitPhotoMutation,
        requestAoi: requestAoiMutation,
    };
};
