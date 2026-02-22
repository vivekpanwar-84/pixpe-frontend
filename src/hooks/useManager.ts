import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managerService } from '@/services/manager.service';

export const useManager = () => {
    const queryClient = useQueryClient();

    const useAllAois = () => {
        return useQuery({
            queryKey: ['aois', 'all'],
            queryFn: managerService.getAllAois,
        });
    };

    const assignAoiMutation = useMutation({
        mutationFn: ({ id, surveyorId }: { id: string; surveyorId: string }) =>
            managerService.assignAoi(id, surveyorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aois'] });
        },
    });

    const createAoiMutation = useMutation({
        mutationFn: (data: any) => managerService.createAoi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aois'] });
        },
    });

    const updateAoiMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            managerService.updateAoi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aois'] });
        },
    });

    const closeAoiMutation = useMutation({
        mutationFn: (id: string) => managerService.closeAoi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aois'] });
        },
    });

    const useAllPhotos = (status?: string) => {
        return useQuery({
            queryKey: ['photos', 'all', status],
            queryFn: () => managerService.getAllPhotos(status),
        });
    };

    const updatePhotoStatusMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            managerService.updatePhotoStatus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos'] });
        },
    });

    const useAllPois = (aoiId?: string) => {
        return useQuery({
            queryKey: ['pois', 'all', aoiId],
            queryFn: () => managerService.getAllPois(), // Pass aoiId if service supports it
        });
    };

    const assignPoiMutation = useMutation({
        mutationFn: ({ id, editorId }: { id: string; editorId: string }) =>
            managerService.assignPoi(id, editorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pois'] });
        },
    });

    const assignPhotoMutation = useMutation({
        mutationFn: ({ id, editorId }: { id: string; editorId: string }) =>
            managerService.assignPhoto(id, editorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos'] });
        },
    });

    const verifyPoiMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            managerService.verifyPoi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos'] });
            queryClient.invalidateQueries({ queryKey: ['pois'] });
        },
    });

    const useAllForms = (status?: string) => {
        return useQuery({
            queryKey: ['forms', 'all', status],
            queryFn: () => managerService.getAllForms(status),
        });
    };

    return {
        useAllAois,
        assignAoi: assignAoiMutation,
        createAoi: createAoiMutation,
        updateAoi: updateAoiMutation,
        closeAoi: closeAoiMutation,
        useAllPhotos,
        updatePhotoStatus: updatePhotoStatusMutation,
        useAllPois,
        assignPoi: assignPoiMutation,
        assignPhoto: assignPhotoMutation,
        verifyPoi: verifyPoiMutation,
        useAllForms,
    };
};
