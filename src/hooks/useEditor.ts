import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { editorService } from '@/services/editor.service';

export const useEditor = () => {
    const queryClient = useQueryClient();

    const useAssignedPois = () => {
        return useQuery({
            queryKey: ['pois', 'assigned'],
            queryFn: editorService.getAssignedPois,
        });
    };

    const useAssignedPhotos = () => {
        return useQuery({
            queryKey: ['photos', 'assigned'],
            queryFn: editorService.getAssignedPhotos,
        });
    };

    const useAssignedPhotoDetails = (id: string) => {
        return useQuery({
            queryKey: ['photos', 'assigned', id],
            queryFn: () => editorService.getAssignedPhotoById(id),
            enabled: !!id,
        });
    };

    const submitFormMutation = useMutation({
        mutationFn: editorService.submitForm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['forms'] });
        },
    });

    const requestReuploadMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            editorService.requestReupload(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['photos', 'assigned'] });
        },
    });

    return {
        useAssignedPois,
        useAssignedPhotos,
        useAssignedPhotoDetails,
        submitForm: submitFormMutation,
        requestReupload: requestReuploadMutation,
    };
};
