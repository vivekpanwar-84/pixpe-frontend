import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { editorService } from '@/services/editor.service';

export const useEditor = () => {
    const queryClient = useQueryClient();

    const useAssignedPhotos = (page: number = 1, limit: number = 20, search: string = '') => {
        return useQuery({
            queryKey: ['photos', 'assigned', { page, limit, search }],
            queryFn: () => editorService.getAssignedPhotos(page, limit, search),
        });
    };

    const useAssignedPhotoDetails = (id: string) => {
        return useQuery({
            queryKey: ['photos', 'assigned', id],
            queryFn: () => editorService.getAssignedPhotoById(id),
            enabled: !!id,
        });
    };

    const useAoiPhotos = (aoiId: string, editorId: string) => {
        return useQuery({
            queryKey: ['photos', 'aoi', aoiId, 'editor', editorId],
            queryFn: () => editorService.getPhotosByAoiAndEditor(aoiId, editorId),
            enabled: !!aoiId && !!editorId,
        });
    };

    const submitFormMutation = useMutation({
        mutationFn: editorService.submitForm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['forms'] });
            queryClient.invalidateQueries({ queryKey: ['photos'] });
            queryClient.invalidateQueries({ queryKey: ['aoi'] });
        },
    });

    const requestReuploadMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            editorService.requestReupload(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos', 'assigned'] });
        },
    });

    const useAssignedAois = (hasForms?: boolean, page: number = 1, limit: number = 20, search: string = '') => {
        return useQuery({
            queryKey: ['aoi', 'assigned', { hasForms, page, limit, search }],
            queryFn: () => editorService.getAssignedAois(hasForms, page, limit, search),
        });
    };

    const useAoiDetails = (id: string) => {
        return useQuery({
            queryKey: ['aoi', 'assigned', id],
            queryFn: () => editorService.getAoiById(id),
            enabled: !!id,
        });
    };

    const useAoiStats = (id: string) => {
        return useQuery({
            queryKey: ['aoi', id, 'stats'],
            queryFn: () => editorService.getAoiStats(id),
            enabled: !!id,
        });
    };

    const useForms = (aoiId?: string, submittedBy?: string, photoId?: string, page: number = 1, limit: number = 20, search: string = '') => {
        return useQuery({
            queryKey: ['forms', aoiId, submittedBy, photoId, { page, limit, search }],
            queryFn: () => editorService.getForms(aoiId, submittedBy, photoId, page, limit, search),
        });
    };

    return {
        useAssignedAois,
        useAoiDetails,
        useAoiStats,
        useAssignedPhotos,
        useAssignedPhotoDetails,
        useAoiPhotos,
        useForms,
        submitForm: submitFormMutation,
        requestReupload: requestReuploadMutation,
    };
};
