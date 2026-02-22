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

    const usePois = (aoiId?: string) => {
        return useQuery({
            queryKey: ['pois', aoiId],
            queryFn: () => surveyorService.getPois(aoiId),
        });
    };

    const usePoiDetail = (id: string) => {
        return useQuery({
            queryKey: ['pois', id],
            queryFn: () => surveyorService.getPoiById(id),
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

    const createPoiMutation = useMutation({
        mutationFn: surveyorService.createPoi,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['aois', 'assigned'] });
            if (variables.aoi_id) {
                queryClient.invalidateQueries({ queryKey: ['aois', 'assigned', variables.aoi_id] });
                queryClient.invalidateQueries({ queryKey: ['pois', variables.aoi_id] });
            }
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
        usePois,
        usePoiDetail,
        useMyUploads,
        startAoi: startAoiMutation,
        submitAoi: submitAoiMutation,
        createPoi: createPoiMutation,
        uploadPhoto: uploadPhotoMutation,
        deletePhoto: deletePhotoMutation,
    };
};
