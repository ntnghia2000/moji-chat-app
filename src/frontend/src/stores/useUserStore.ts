import { create } from 'zustand';
import type { UserState } from '../types/store';
import { userService } from '../services/userService';
import { useAuthStore } from './useAuthStore';
import { toast } from 'sonner';
import { useChatStore } from './useChatStore';

export const useUserStore = create<UserState>((set, get) => ({

    updateAvatarUrl: async (formData) => {
        try {
            const { user, setUser } = useAuthStore.getState();
            const data = await userService.uploadAvatar(formData);
            if (user) {
                setUser({
                    ...user,
                    avatarUrl: data.avatarUrl
                });
                useChatStore.getState().fetchConversations();
            }
        } catch (error) {
            console.error("Error when calling update avatar url", error);
            toast.error("Uploaded avatar fail.");
        }
    }
}));