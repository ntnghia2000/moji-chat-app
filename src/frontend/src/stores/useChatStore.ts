import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatState } from '../types/store';
import { chatService } from '../services/chatService';
import { useAuthStore } from './useAuthStore';
import { useSocketStore } from './useSocketStore';

export const useChatStore = create<ChatState>() (
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            conversationLoading: false,
            messageLoading: false,
            loading: false,

            setActiveConversation: (id) => set({ activeConversationId: id }),

            reset: () => {
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    conversationLoading: false,
                    messageLoading: false
                });
            },

            fetchConversations: async () => {
                try {
                    set({ conversationLoading: true });
                    const { conversations } = await chatService.fetchConversations();

                    set({ conversations, conversationLoading: false });
                } catch (error) {
                    console.error("Error while trying to fetch conversations: ", error);
                    set({ conversationLoading: false });
                }
            },

            fetchMessages: async (conversationId) => {
                const { activeConversationId, messages } = get();
                const { user, accessToken } = useAuthStore.getState();
                const convoId = conversationId ?? activeConversationId;
                if (!convoId) {
                    return;
                }
                console.log("access token: ", accessToken);
                const current = messages?.[convoId];
                const nextCursor = current?.nextCursor === undefined ? "" : current?.nextCursor;
                if (nextCursor === null) {
                    return;
                }
                set({ messageLoading: true });

                try {
                    const { messages: fetchMessages, cursor } = await chatService.fetchMessages(convoId, nextCursor);
                    const processed = fetchMessages.map((message) => ({
                        ...message,
                        isOwn: message.senderId === user?._id
                    }));

                    set((state) => {
                        const prev = state?.messages[convoId]?.items ?? [];
                        const merged = prev.length > 0 ? [...processed, ...prev] : processed;
                        return {
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: merged,
                                    hasMore: !!cursor,
                                    nextCursor: cursor ?? null
                                }
                            }
                        };
                    });
                } catch (error) {
                    console.error("Error while trying to fetch messages: ", error);
                    set({ messageLoading: false });
                } finally {
                    set({ messageLoading: false });
                }
            },

            sendDirectMessage: async (recipientId, content, imgUrl) => {
                try {
                    const { activeConversationId } = get();
                    await chatService.sendDirectMessage(recipientId, content, imgUrl, activeConversationId || undefined);
                    set((state) => ({
                        conversations: state.conversations.map((c) => 
                            c._id === activeConversationId ? {...c, seenBy: []} : c
                        ),
                    }));
                } catch (error) {
                    console.error("Error while trying to send direct messages: ", error);
                }
            },

            sendGroupMessage: async (conversationId, content, imgUrl) => {
                try {
                    await chatService.sendGroupMessage(conversationId, content, imgUrl);
                    set((state) => ({
                        conversations: state.conversations.map((c) => 
                            c._id === get().activeConversationId ? {...c, seenBy: []} : c
                        ),
                    }));
                } catch (error) {
                    console.error("Error while trying to send group messages: ", error);
                }
            },

            addMessage: async (message) => {
                try {
                    const { user } = useAuthStore.getState();
                    const { fetchMessages } = get();

                    message.isOwn = message.senderId === user?._id;
                    const convoId = message.conversationId;
                    let prevItems = get().messages[convoId]?.items ?? [];
                    /*
                        Check if user haven open message yet. Then fetch all old message before add 
                        new message to this conversation to make sure message order always correctly.
                    */
                    if (prevItems.length == 0) {
                        await fetchMessages(message.conversationId);
                        prevItems = get().messages[convoId]?.items ?? [];
                    }
                    set((state) => {
                        if (prevItems.some((m) => m._id === message._id)) {
                            return state;
                        }
                        return {
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: [...prevItems, message],
                                    hasMore: state.messages[convoId].hasMore,
                                    nextCursor: state.messages[convoId].nextCursor ?? undefined
                                }
                            }
                        }
                    });

                } catch (error) {
                    console.error("Error while trying to add messages: ", error);
                }
            },

            updateConversation: (conversation) => {
                set((state) => ({
                    conversations: state.conversations.map((c) => 
                        c._id === conversation._id ? {...c, ...conversation} : c
                    ),
                }));
            },

            markAsSeen: async () => {
                try {
                    const { user } = useAuthStore.getState();
                    const { activeConversationId, conversations } = get();
                    if (!activeConversationId || !user) {
                        return;
                    }
                    const convo = conversations.find((c) => c._id === activeConversationId);
                    if (!convo) {
                        return;
                    }

                    if ((convo.unreadCount?.[user._id] ?? 0) === 0) {
                        return;
                    }
                    await chatService.markAsSeen(activeConversationId);

                    set((state) => ({
                        conversations: state.conversations.map((c) => 
                            c._id === activeConversationId && c.lastMessage ? {
                                ...c,
                                unreadCount: {
                                    ...c.unreadCount,
                                    [user._id]: 0
                                }
                            } : c
                        )
                    }));
                } catch (error) {
                    console.error("Error while trying mark message as read: ", error);
                }
            },

            addConversation: (conversation) => {
                set((state) => {
                    const isConversationExisted = state.conversations.some((c) => c._id.toString() == conversation._id.toString());
                    return {
                        conversations: isConversationExisted ? state.conversations : [conversation, ...state.conversations],
                        activeConversationId: conversation._id
                    }
                })
            },

            createConversation: async (type, name, memberIds) => {
                try {
                    set({ loading: true });
                    const conversation = await chatService.createConversation(type, name, memberIds);
                    get().addConversation(conversation);
                    useSocketStore.getState().socket?.emit("join-conversation", conversation._id);
                } catch (error) {
                    console.error("Error while trying create a conversations: ", error);
                } finally {
                    set({ loading: false });
                }
            }
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({ conversations: state.conversations })
        }
    )
)