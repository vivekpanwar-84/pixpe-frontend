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
        mutationFn: ({ id, data }: { id: string; data: { surveyor_id?: string; editor_id?: string } }) =>
            managerService.assignAoi(id, data),
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

    const bulkAssignAoiMutation = useMutation({
        mutationFn: (data: { aoi_ids: string[]; surveyor_id?: string; editor_id?: string }) =>
            managerService.bulkAssignAoi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aois'] });
        },
    });

    const useAllPhotos = (filters?: { status?: string, aoiId?: string }) => {
        return useQuery({
            queryKey: ['photos', 'all', filters],
            queryFn: () => managerService.getAllPhotos(filters?.status, filters?.aoiId),
        });
    };

    const updatePhotoStatusMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            managerService.updatePhotoStatus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos'] });
        },
    });

    const assignPhotoMutation = useMutation({
        mutationFn: ({ id, editorId }: { id: string; editorId: string }) =>
            managerService.assignPhoto(id, editorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos'] });
        },
    });

    const useAllForms = (filters?: { status?: string, photoId?: string, aoiId?: string }) => {
        return useQuery({
            queryKey: ['forms', 'all', filters],
            queryFn: () => managerService.getAllForms(filters?.status, filters?.photoId, filters?.aoiId),
        });
    };

    return {
        useAllAois,
        assignAoi: assignAoiMutation,
        bulkAssignAoi: bulkAssignAoiMutation,
        createAoi: createAoiMutation,
        updateAoi: updateAoiMutation,
        closeAoi: closeAoiMutation,
        useAllPhotos,
        updatePhotoStatus: updatePhotoStatusMutation,
        assignPhoto: assignPhotoMutation,
        useAllForms,
    };
};
