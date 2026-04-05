import api from '@/lib/axios';

export const friendService = {
    async searchByUserName(username: string) {
        const res = await api.get(`/user/search?username=${username}`);
        return res.data.user;
    },

    async sendFriendRequest(to: string, message?: string) {
        const res = await api.post('/friends/requests', { to, message });
        return res.data.message;
    },

    async getAllFriendRequests() {
        try {
            const res = await api.get("/friends/requests");
            const { sent, received } = res.data;
            return { sent, received };
        } catch (error) {
            console.error("Error while get all friend requests: ", error);
        }
    },

    async acceptRequest(requestId: string) {
        try {
            const res = await api.post(`/friends/requests/${requestId}/accept`);
            return res.data.requestAcceptedBy;
        } catch (error) {
            console.error("Error while accept request: ", error);
        }
    },

    async declineRequest(requestId: string) {
        try {
            await api.post(`/friends/requests/${requestId}/decline`);
        } catch (error) {
            console.error("Error while decline request: ", error);
        }
    },

    async getFriendList() {
        const res = await api.get("/friends");
        return res.data.friends;
    }
}