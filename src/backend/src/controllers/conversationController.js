import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export const createConversation = async (req, res) => {
    try {
        const { type, name, memberIds } = req.body;
        const userId = req.user._id;

        if (!type || (type == "group" && !name) || !memberIds || memberIds.length <= 0) {
            return res.status(400).json({ message: "Name and participants is needed." });
        }

        let conversation;

        if (type == "direct") {
            const participantId = memberIds[0];
            conversation = await Conversation.findOne({
                type: "direct",
                "participants.userId": { $all: [userId, participantId] }
                /**
                 * Query participants field in mongoDB.
                 * Find all documents which match with user id.
                 * $all: stand for all ids which have to match with user id of participants.
                 * Which mean, participants need to contain all these id.
                */
            });

            if (!conversation) {
                conversation = new Conversation({
                    type: 'direct',
                    participants: [{ userId }, { userId: participantId }],
                    lastMessageAt: new Date()
                });
                await conversation.save();
            }
        }

        if (type == 'group') {
            conversation = new Conversation({
                type: 'group',
                participants: [
                    { userId }, 
                    ...memberIds.map((id) => ({ userId: id }))
                ],
                group: {
                    name,
                    createdBy: userId
                },
                lastMessageAt: new Date()
            });
            await conversation.save();
        }

        if (!conversation) {
            return res.status(400).json({ message: "Wrong conversation type. Please try again." });
        }

        /**
         * Get data from others models to fill into conversation data.
        */
        await conversation.populate([
            {
                /** 
                 * Fill and show display name & avatar of participants.
                */
                path: 'participants.userId',
                select: "displayName avatarUrl"
            },
            {
                /**
                 * Fill and show display name & avatar of user who seen messages.
                */
                path: 'seenBy',
                select: "displayName avatarUrl"
            },
            {
                /** 
                 * Fill and show display name & avatar of user sent last message.
                */
                path: 'lastMessage.senderId',
                select: "displayName avatarUrl"
            }
        ]);

        const participants = (conversation.participants || []).map((p) => ({
            _id: p.userId?._id,
            displayName: p.userId?.displayName,
            avatarUrl: p.userId?.avatarUrl ?? null,
            joinedAt: p.joinedAt
        }));

        const formatted = {...conversation.toObject(), participants};
        if (type == "group") {
            memberIds.forEach((userId) => {
                io.to(userId).emit("new-group", formatted);
            });
        }

        return res.status(201).json({ conversation: formatted });

    } catch (error) {
        console.error("Error when calling create conversation", error);
        return res.status(500).json({ message: "System error!" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({
            'participants.userId': userId,
        })
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .populate({
            path: 'participants.userId',
            select: "displayName avatarUrl"
        })
        .populate({
            path: 'lastMessage.senderId',
            select: "displayName avatarUrl"
        })
        .populate({
            path: 'seenBy',
            select: "displayName avatarUrl"
        });

        const formatted = conversations.map((convo) => {
            const participants = (convo.participants || []).map((p) => ({
                _id: p.userId?._id,
                displayName: p.userId?.displayName,
                avatarUrl: p.userId?.avatarUrl ?? null,
                joinedAt: p.joinedAt
            }));
            return {
                ...convo.toObject(), // convert mongoose document to js object.
                unreadCount: convo.unreadCount || {},
                participants
            }
        });
        return res.status(200).json({ conversations: formatted });

    } catch (error) {
        console.error("Error when calling get conversations", error);
        return res.status(500).json({ message: "System error!" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, cursor } = req.query;
        /**
         * param: /conversations/${conversationId}/messages?limit=${pageLimit}&cursor=${cursor}
         *  request query: limit=${pageLimit}&cursor=${cursor}
        */
        const query = { conversationId };
        if (cursor) {
            query.createdAt = { $lt: new Date(cursor) }; // $lt: less than
        }
        let messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) + 1);

        let nextCursor = null;
        if (messages.length > Number(limit)) {
            const nextMessage = messages[messages.length - 1];
            nextCursor = nextMessage.createdAt.toISOString();
            messages.pop();
        }
        messages = messages.reverse();
        return res.status(200).json({ messages, nextCursor });

    } catch (error) {
        console.error("Error when calling get messages", error);
        return res.status(500).json({ message: "System error!" });
    }
};

export const getUserConversationForSocketIO = async (userId) => {
    try {
        const conversations = await Conversation.find(
            { "participants.userId": userId },
            { _id: 1 }
        );
        return conversations.map((c) => c._id.toString());
    } catch (error) {
        console.error("Error while fetching conversation for socket io.", error);
        return [];
    }
};

export const markAsSeen = async () => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id.toString();
        const conversation = await Conversation.findById(conversationId).lean();
        if (!conversation) {
            return res.status(404).json({ message: "Conversation does not exist." });
        }
        const last = conversation.lastMessage;
        if (!last) {
            return res.status(200).json({ message: "There is no message to mark as seen." });
        }
        if (last.senderId.toString() == userId) {
            return res.status(200).json({ message: "Sender no need to mark as seen." });
        }
        const updated = await Conversation.findByIdAndUpdate(conversationId, {
            $addToSet: { seenBy: userId }, // &addToSet: add userId to seenBy array.
            $set: {[`unreadCount.${userId}`]: 0}, // $set: assign value to unreadCount[userId].
        }, {
            new: true
        });

        io.to(conversationId).emit("read-message", {
            conversation: updated,
            lastMessage: {
                _id: updated?.lastMessage._id,
                content: updated?.lastMessage.content,
                createdAt: updated?.lastMessage.createdAt,
                sender: {
                    _id: updated?.lastMessage.senderId
                }
            }
        });

        return res.status(200).json({ 
            message: "Mark as read.",
            seenBy: updated?.seenBy || [],
            myUnreadCount: updated.unreadCount[userId] || 0
        });

    } catch (error) {
        console.error("Error while mark message to seen.", error);
        return res.status(500).json({ message: "System error!" });
    }
}