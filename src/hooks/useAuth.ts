import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { useAuthContext } from '@/providers/AuthContext';

export const useAuth = () => {
    const { login: syncLogin, setPendingUser } = useAuthContext();

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (data) => {
            // Bypass OTP: Direct login with data from /auth/login
            syncLogin(data.user, data.access_token);
            // setPendingUser(data.user); // Original OTP flow
        },
    });

    const requestOtpMutation = useMutation({
        mutationFn: authService.requestOtp,
    });

    const verifyOtpMutation = useMutation({
        mutationFn: authService.verifyOtp,
        onSuccess: (data) => {
            syncLogin(data.user, data.access_token);
        },
    });

    const useProfile = () => {
        return useQuery({
            queryKey: ['profile'],
            queryFn: userService.getProfile,
            enabled: !!localStorage.getItem('token'),
        });
    };

    const signupAdminMutation = useMutation({
        mutationFn: authService.createAdmin,
    });

    return {
        login: loginMutation,
        requestOtp: requestOtpMutation,
        verifyOtp: verifyOtpMutation,
        signupAdmin: signupAdminMutation,
        useProfile,
    };
};
