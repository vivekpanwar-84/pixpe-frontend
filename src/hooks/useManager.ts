import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { managerService } from '@/services/manager.service';

export const useManager = () => {
    const queryClient = useQueryClient();

    const useAllAois = (page: number = 1, limit: number = 20, search: string = '') => {
        return useQuery({
            queryKey: ['aois', 'all', { page, limit, search }],
            queryFn: () => managerService.getAllAois(page, limit, search),
            placeholderData: keepPreviousData,
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

    const bulkCreateAoiMutation = useMutation({
        mutationFn: (formData: FormData) => managerService.bulkCreateAoi(formData),
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

    const useAllPhotos = (filters?: { status?: string, aoiId?: string, page?: number, limit?: number, search?: string }) => {
        return useQuery({
            queryKey: ['photos', 'all', filters],
            queryFn: () => managerService.getAllPhotos(filters?.status, filters?.aoiId, filters?.page || 1, filters?.limit || 20, filters?.search),
            placeholderData: keepPreviousData,
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

    const bulkAssignPhotosMutation = useMutation({
        mutationFn: ({ photoIds, editorId }: { photoIds: string[]; editorId: string }) =>
            managerService.bulkAssignPhotos(photoIds, editorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos'] });
        },
    });

    const useAllForms = (filters?: { status?: string, photoId?: string, aoiId?: string, page?: number, limit?: number, search?: string }) => {
        return useQuery({
            queryKey: ['forms', 'all', filters],
            queryFn: () => managerService.getAllForms(filters?.status, filters?.photoId, filters?.aoiId, filters?.page || 1, filters?.limit || 20, filters?.search),
            placeholderData: keepPreviousData,
        });
    };

    return {
        useAllAois,
        assignAoi: assignAoiMutation,
        bulkAssignAoi: bulkAssignAoiMutation,
        createAoi: createAoiMutation,
        bulkCreateAoi: bulkCreateAoiMutation,
        updateAoi: updateAoiMutation,
        closeAoi: closeAoiMutation,
        useAllPhotos,
        updatePhotoStatus: updatePhotoStatusMutation,
        assignPhoto: assignPhotoMutation,
        bulkAssignPhotos: bulkAssignPhotosMutation,
        useAllForms,
    };
};
