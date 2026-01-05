import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../services/dashboardService';
import useAuthStore from '../stores/authStore';

const useDashboardQuery = () => {
    const { isAuthenticated, logout } = useAuthStore();

    return useQuery({
        queryKey: ['dashboard'],
        queryFn: getDashboard,
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            console.error('Dashboard error:', error.message);
            if (
                error.message.toLowerCase().includes('unauthorized') ||
                error.message.toLowerCase().includes('token') ||
                error.message.toLowerCase().includes('expired') ||
                error.message.toLowerCase().includes('unauthenticated')
            ) {
                logout();
            }
        },
    });
};

export default useDashboardQuery;