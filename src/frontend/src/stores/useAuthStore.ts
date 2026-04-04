import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import type { AuthState } from '../types/store';
import { persist } from 'zustand/middleware';
import { useChatStore } from './useChatStore';

export const useAuthStore = create<AuthState>() (
    persist(
        (set, get) => ({
            accessToken: null,
            user: null,
            loading: false,

            setAccessToken: (accessToken: string) => {
                set({ accessToken });
            },

            clearState: () => {
                set({ 
                    accessToken: null,
                    user: null,
                    loading: false
                });
                useChatStore.getState().reset();
                localStorage.clear();
                sessionStorage.clear();
            },

            setUser: (user) => {
                set({ user });
            },

            signUp: async (username, password, email, firstName, lastName) => {
                try {
                    set({ loading: true });
                    await authService.signUp(username, password, email, firstName, lastName);
                    toast.success("Sign up successfully!")
                } catch (error) {
                    console.error(error);
                    toast.error("Sign up unsuccess!");
                } finally {
                    set({ loading: false });
                }
            },

            signIn: async (username, password) => {
                try {
                    get().clearState();
                    set({ loading: true });

                    const { accessToken } = await authService.signIn(username, password);
                    get().setAccessToken(accessToken);

                    await get().fetchMe();
                    useChatStore.getState().fetchConversations();

                    toast.success("Welcome back!")
                } catch (error) {
                    console.error(error);
                    toast.error("Sign in unsuccess!");
                } finally {
                    set({ loading: false });
                }
            },

            signOut: async () => {
                try {
                    get().clearState();
                    await authService.signOut();
                    
                    toast.success("Sign out success!")
                } catch (error) {
                    console.error(error);
                    toast.error("Sign out unsuccess!");
                }
            },

            fetchMe: async () => {
                try {
                    set({ loading: true });
                    const user = await authService.fetchMe();
                    set({ user });

                    toast.success("Fetch me success!");
                } catch (error) {
                    console.error(error);
                    set({ user: null, accessToken: null });
                    toast.error("Error while trying to get user data!");
                } finally {
                    set({ loading: false });
                }
            },

            refresh: async () => {
                try {
                    set({ loading: true });
                    const { user, fetchMe, setAccessToken } = get();
                    const accessToken = await authService.refresh();
                    setAccessToken(accessToken);
                    if (!user) {
                        await fetchMe();
                    }

                    toast.success("Fetch me success!")
                } catch (error) {
                    console.error(error);
                    toast.error("Session has been expired! Please sign in again!");
                } finally {
                    set({ loading: false });
                }
            },

            test: async () => {
                await authService.refresh();
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);