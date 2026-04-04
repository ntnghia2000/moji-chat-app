import { create } from 'zustand';
import { friendService } from '../services/friendService';
import type { FriendState } from '../types/store';

export const useFriendStore = create<FriendState>() (
    (set, get) => ({
        loading: false,
        receivedList: [],
        sentList: [],
        friends: [],
        searchByUserName: async (username: string) => {
            try {
                set({ loading: true });
                const user = await friendService.searchByUserName(username);
                return user;
            } catch (error) {
                console.error("Error while searching user: ", error);
                return null;
            } finally {
                set({ loading: false });
            }
        },

        addFriend: async (to: string, message?: string) => {
            try {
                set({ loading: true });
                const resultMessage = await friendService.sendFriendRequest(to, message);
                return resultMessage;
            } catch (error) {
                console.error("Error while adding friend: ", error);
                return "Error while adding friend.";
            } finally {
                set({ loading: false });
            }
        },

        getAllFriendRequests: async () => {
            try {
                set({loading: true});
                const result = await friendService.getAllFriendRequests();
                if (!result) {
                    return;
                }
                const { received, sent } = result;
                set({ receivedList: received, sentList: sent });
            } catch (error) {
                console.error("Error while get all friend requests: ", error);
            } finally {
                set({ loading: false });
            }
        },

        acceptRequest: async (requestId: string) => {
            try {
                set({loading: true});
                await friendService.acceptRequest(requestId);

                set((state) => ({
                    receivedList: state.receivedList.filter((r) => r._id !== requestId),
                }));
            } catch (error) {
                console.error("Error while accept friend request: ", error);
            } finally {
                set({ loading: false });
            }
        },

        declineRequest: async (requestId: string) => {
            try {
                set({loading: true});
                await friendService.declineRequest(requestId);
                set((state) => ({
                    receivedList: state.receivedList.filter((r) => r._id !== requestId),
                }));
            } catch (error) {
                console.error("Error while decline friend request: ", error);
            } finally {
                set({ loading: false });
            }
        },

        getFriends: async () => {
            try {
                set({ loading: true });
                const friends = await friendService.getFriendList();
                set({ friends: friends });
            } catch (error) {
                console.error("Error while get friend list: ", error);
                set({ friends: [] });
            } finally {
                set({ loading: false });
            }
        }
    })
);