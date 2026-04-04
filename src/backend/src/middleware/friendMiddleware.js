import Conversation from "../models/conversation.js";
import Friend from "../models/friend.js";

const compare = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString();
        const recipientId = req.body.recipientId ?? null; // if null or undefine ==> null;
        const memberIds = req.body.memberIds ?? [];

        if (!recipientId && memberIds.length <= 0) {
            return res.status(400).json({ message: "Please give a recipientId or memberId" });
        }

        if (recipientId) {
            const [userA, userB] = compare(me, recipientId);
            const isFriend = await Friend.findOne({ userA, userB });

            if (!isFriend) {
                return res.status(403).json({ message: "You are not friends" });
            }

            return next();
        }

        const friendChecks = memberIds.map(async (memberId) => {
            const [userA, userB] = compare(me, memberId); // sort user orders.
            const friend = await Friend.find({ userA, userB });
            return friend ? null : memberId;
        });

        const results = await Promise.all(friendChecks);
        const notFriends = results.filter(Boolean); // filter all null results.
        if (notFriends.length > 0) {
            return res.status(403).json({ message: "You can only add your friends to group chat.", notFriends });
        }
        next();
        
    } catch (error) {
        console.error("Error when checking friendships", error);
        return res.status(500).json({ message: "System error!" });
    }
}

export const checkGroupMember = async (req, res, next) => {
    try {
        const { conversationId } = req.body;
        const userId = req.user._id;
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found!" });
        }
        const isMember = conversation.participants.some((p) => p.userId.toString() == userId.toString());
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group!" });
        }
        req.conversation = conversation;
        next();
        
    } catch (error) {
        console.error("Error when checking friendships", error);
        return res.status(500).json({ message: "System error!" });
    }
}