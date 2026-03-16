import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { editorService } from '@/services/editor.service';

export const useEditor = () => {
    const queryClient = useQueryClient();

    const useAssignedPhotos = (page: number = 1, limit: number = 20, search: string = '') => {
        return useQuery({
            queryKey: ['photos', 'assigned', { page, limit, search }],
            queryFn: () => editorService.getAssignedPhotos(page, limit, search),
            placeholderData: keepPreviousData,
        });
    };

    const useAssignedPhotoDetails = (id: string) => {
        return useQuery({
            queryKey: ['photos', 'assigned', id],
            queryFn: () => editorService.getAssignedPhotoById(id),
            enabled: !!id,
            placeholderData: keepPreviousData,
        });
    };

    const useAoiPhotos = (aoiId: string, editorId: string) => {
        return useQuery({
            queryKey: ['photos', 'aoi', aoiId, 'editor', editorId],
            queryFn: () => editorService.getPhotosByAoiAndEditor(aoiId, editorId),
            enabled: !!aoiId && !!editorId,
            placeholderData: keepPreviousData,
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

    const useAssignedAois = (isEditor: boolean = false, page: number = 1, limit: number = 20, search: string = '') => {
        return useQuery({
            queryKey: ['assigned-aois', { isEditor, page, limit, search }],
            queryFn: () => editorService.getAssignedAois(isEditor, page, limit, search),
            placeholderData: keepPreviousData,
        });
    };

    const useAoiDetails = (id: string) => {
        return useQuery({
            queryKey: ['aoi', 'assigned', id],
            queryFn: () => editorService.getAoiById(id),
            enabled: !!id,
            placeholderData: keepPreviousData,
        });
    };

    const useAoiStats = (id: string) => {
        return useQuery({
            queryKey: ['aoi-stats', id],
            queryFn: () => editorService.getAoiStats(id),
            enabled: !!id,
            placeholderData: keepPreviousData,
        });
    };

    const useForms = (aoiId?: string, submittedBy?: string, photoId?: string, page: number = 1, limit: number = 20, search: string = '') => {
        return useQuery({
            queryKey: ['forms', aoiId, submittedBy, photoId, { page, limit, search }],
            queryFn: () => editorService.getForms(aoiId, submittedBy, photoId, page, limit, search),
            placeholderData: keepPreviousData,
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
