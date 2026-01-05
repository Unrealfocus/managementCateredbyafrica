// src/hooks/useInfiniteCustomers.js
import { useInfiniteQuery } from '@tanstack/react-query';
// import CustomersAPI from '../services/customerService';
import useAuthStore from '../stores/authStore';

const useInfinite = (endpointFn, search = '') => {
    const { isAuthenticated, logout } = useAuthStore();

    return useInfiniteQuery({
        queryKey: [endpointFn.name, search],
        queryFn: ({ pageParam = 1 }) => endpointFn(search, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            console.log(lastPage)
            const pagination = lastPage || {};
            return pagination.current_page < pagination.last_page
                ? pagination.current_page + 1
                : undefined;
        },
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
        keepPreviousData: true, // Smooth UX when searching
        onError: (error) => {
            console.error(`${endpointFn.name} error:`, error.message);
            const msg = error.message?.toLowerCase() || '';
            if (
                msg.includes('unauthorized') ||
                msg.includes('token') ||
                msg.includes('expired') ||
                msg.includes('unauthenticated')
            ) {
                logout();
            }
        },
    });
};

export default useInfinite;