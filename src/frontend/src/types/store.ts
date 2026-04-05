import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { Friend, FriendRequest, User } from "./user";

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean;

    setAccessToken: (accessToken: string) => void;
    signUp: (username: string, password: string, email: string, firstName: string, lastName: string) => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchMe: () => Promise<void>;
    refresh: () => Promise<void>;
    test: () => Promise<void>;
    clearState: () => void;
    setUser: (user: User) => void;
}

export interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
}

export interface ChatState {
    conversations: Conversation[],
    messages: Record<string, {
        items: Message[],
        hasMore: boolean, // infinite-scroll
        nextCursor?: string | null
    }>;
    activeConversationId: string | null;
    conversationLoading: boolean;
    messageLoading: boolean;
    loading: boolean;
    reset: () => void;
    setActiveConversation: (id: string | null) => void;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId?: string) => Promise<void>;
    sendDirectMessage: (recipientId: string, content: string, imgUrl?: string) => Promise<void>;
    sendGroupMessage: (conversationId: string, content: string, imgUrl?: string) => Promise<void>;
    addMessage: (message: Message) => Promise<void>;
    updateConversation: (conversation: unknown) => void;
    markAsSeen: () => Promise<void>;
    addConversation: (conversation: Conversation) => void;
    createConversation: (type: "direct" | "group", name: string, memberId: string[]) => Promise<void>
}

export interface SocketState {
    socket: Socket | null,
    onlineUsers: string[],
    connectSocket: () => void,
    disconnectSocket: () => void
}

export interface FriendState {
    loading: boolean,
    receivedList: FriendRequest[];
    sentList: FriendRequest[];
    friends: Friend[],
    searchByUserName: (username: string) => Promise<User | null>;
    addFriend: (to: string, message?: string) => Promise<string>;
    getAllFriendRequests: () => Promise<void>;
    acceptRequest: (requestId: string) => Promise<void>;
    declineRequest: (requestId: string) => Promise<void>;
    getFriends: () => Promise<void>;
}

export interface UserState {
    updateAvatarUrl: (formData: FormData) => Promise<void>;
}
