import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Optional: persists auth state in localStorage

const useAuthStore = create(
    persist(
        (set) => ({
            // Initial state
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,


            login: async (data) => {
                set({
                    user: data.user || data.data?.user,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },
            initializeAuth: async () => {
                const token = localStorage.getItem('cateredbyafrica_marketing_admin_key');
                if (!token) {
                    set({ loading: false });
                    return;
                }
                set({
                    isAuthenticated: true,
                });

            },
            fetchProfile: async () => {
                try {
                    const token = localStorage.getItem('cateredbyafrica_marketing_admin_key');
                    if (!token) {
                        set({ loading: false, user: null, church: null, isAuthenticated: false });
                        return;
                    }

                    const [response] = await Promise.all([
                        fetchUserProfile(),
                    ]);

                    if (response) {
                        set({
                            user: profile.data.user,
                            isAuthenticated: true,
                        });
                    }
                    set({ loading: false });
                } catch (error) {
                    console.error("Error fetching profile:", error);
                    set({ loading: false });
                }
            },
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
                // Optional: clear token from localStorage manually if not using persist
            },

            // Set user (e.g., after page refresh or fetching profile)
            setUser: (userData) => {
                set({
                    user: userData.user,
                    token: userData.token,
                    isAuthenticated: true,
                });
            },

            // Clear error
            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage', // key in localStorage
            // Optional: only persist token and user, not loading/error
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;