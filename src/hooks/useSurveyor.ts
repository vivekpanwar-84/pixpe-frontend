import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyorService } from '@/services/surveyor.service';

export const useSurveyor = () => {
    const queryClient = useQueryClient();

    const useAssignedAois = () => {
        return useQuery({
            queryKey: ['aois', 'assigned'],
            queryFn: surveyorService.getAssignedAois,
        });
    };

    const useAssignedAoiDetail = (id: string) => {
        return useQuery({
            queryKey: ['aois', 'assigned', id],
            queryFn: () => surveyorService.getAssignedAoiById(id),
            enabled: !!id,
        });
    };

    const useMyUploads = () => {
        return useQuery({
            queryKey: ['photos', 'my-uploads'],
            queryFn: surveyorService.getMyUploads,
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

    return {
        useAssignedAois,
        useAssignedAoiDetail,
        useMyUploads,
        startAoi: startAoiMutation,
        submitAoi: submitAoiMutation,
        uploadPhoto: uploadPhotoMutation,
        deletePhoto: deletePhotoMutation,
    };
};
