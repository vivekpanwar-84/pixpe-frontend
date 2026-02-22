import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

export const useAdmin = () => {
    const queryClient = useQueryClient();

    // Query: Fetch all users
    const useAllUsers = (role?: string) => {
        return useQuery({
            queryKey: ['users', role],
            queryFn: () => adminService.getAllUsers(role),
        });
    };

    // Mutation: Create a new user
    const createUserMutation = useMutation({
        mutationFn: adminService.createUser,
        onSuccess: () => {
            // Invalidate users list to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    // Mutation: Update a user
    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            adminService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    // Mutation: Delete a user
    const deleteUserMutation = useMutation({
        mutationFn: adminService.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    // Mutation: Update user status
    const updateUserStatusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            adminService.updateUserStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    return {
        useAllUsers,
        createUser: createUserMutation,
        updateUser: updateUserMutation,
        deleteUser: deleteUserMutation,
        updateUserStatus: updateUserStatusMutation,
    };
};
