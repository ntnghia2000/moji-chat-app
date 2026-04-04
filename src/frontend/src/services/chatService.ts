import api from '@/lib/axios';
import type { ConversationResponse, Message } from '../types/chat';
const PAGE_LIMIT = 20;

interface IFetchMessage {
    messages: Message[],
    cursor?: string
}

export const chatService = {
    async fetchConversations(): Promise<ConversationResponse> {
        const res = await api.get('/conversations');
        return res.data;
    },

    async fetchMessages(id: string, cursor?: string): Promise<IFetchMessage> {
        const res = await api.get(
            `/conversations/${id}/messages?limit=${PAGE_LIMIT}&cursor=${cursor}`
        );
        return { messages: res.data.messages, cursor: res.data.nextCursor };
    },

    async sendDirectMessage(recipientId: string, content: string = "", imgUrl?: string, conversationId?: string) {
        const res = await api.post("/messages/direct", {
            recipientId, content, imgUrl, conversationId
        });
        return res.data.message;
    },

    async sendGroupMessage(conversationId: string, content: string = "", imgUrl?: string) {
        const res = await api.post("/messages/group", {
            conversationId, content, imgUrl
        });
        return res.data.message;
    },

    async markAsSeen(conversationId: string) {
        const res = await api.patch(`/conversations/${conversationId}/seen`);
        return res.data;
    },

    async createConversation(type: "direct" | "group", name: string, memberIds: string[]) {
        const res = await api.post("/conversation", { type, name, memberIds });
        return res.data.conversation;
    }
}