import Friend from "../models/friend.js";
import User from "../models/user.js";
import FriendRequest from "../models/friendRequest.js";
import { abort } from "process";

export const sendFriendRequest = async (req, res) => {
    try {
        const { to, message } = req.body;
        const from = req.user._id;
        if (from === to) {
            return res.status(400).json({ message: "Can not send friend request to yourself." });
        }

        const isUserExists = await User.exists({ _id: to });
        if (!isUserExists) {
            return res.status(404).json({ message: "User does not exists." });
        }

        let userA = from.toString();
        let userB = to.toString();
        if (userA > userB) {
            [userA, userB] = [userB, userA] // swap a and b.
        }

        const [alreadyFriend, existingRequest] = await Promise.all([ // execute 2 promises at the same time.
            Friend.findOne({ userA, userB }),
            // Checking if there is any friend request sent from one of both.
            FriendRequest.findOne({
                $or: [ // find by two ways
                    { from, to},
                    {
                        from: to,
                        to: from
                    }
                ]
            })
        ]);
        if (alreadyFriend) {
            return res.status(400).json({ message: "You are already friends." });
        }
        if (existingRequest) {
            return res.status(400).json({ message: "Friend request existed." });
        }

        const friendRequest = await FriendRequest.create({ from, to, message });
        return res.status(201).json({ message: "Friend request sent.", friendRequest });

    } catch (error) {
        console.error("Error when calling add friend", error);
        return res.status(500).json({ message: "System error!" });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;
        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Friend request not found." });
        }
        if (request.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can not accept this request." }); 
        }
        const friend = await Friend.create({
            userA: request.from,
            userB: request.to
        });
        await FriendRequest.findByIdAndDelete(requestId);
        const from = await User.findById(request.from)
            .select("_id displayName avatarUrl")
            .lean(); // using js object instead of mongoose document.

        return res.status(200).json({ 
            message: "Friend request accepted.",
            newFriend: {
                _id: from?._id,
                displayName: from?.displayName,
                avatarUrl: from?.avatarUrl
            }
        });
        
    } catch (error) {
        console.error("Error when calling accept friend request", error);
        return res.status(500).json({ message: "System error!" });
    }
};

export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;
        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Friend request not found." });
        }
        if (request.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can not accept this request." }); 
        }
        await FriendRequest.findByIdAndDelete(requestId);
        return res.sendStatus(204);

    } catch (error) {
        console.error("Error when calling decline friend request", error);
        return res.status(500).json({ message: "System error!" });
    }
};

export const getAllFriends = async (req, res) => {
    try {
        const userId = req.user._id;
        const friendships = await Friend.find({
            $or: [
                {
                    userA: userId
                },
                {
                    userB: userId
                }
            ]
        })
        .populate("userA", "_id displayName avatarUrl username") // get user data (id, display name, avatar, username) of user A
        .populate("userB", "_id displayName avatarUrl username") // get user data (id, display name, avatar, username) of user B
        .lean();

        if (!friendships) {
            return res.status(200).json({ friends: [] });
        }
        const friends = friendships.map(f => 
            f.userA._id.toString() == userId.toString() ? f.userB : f.userA
        );
        return res.status(200).json({ friends });

    } catch (error) {
        console.error("Error when calling get friends", error);
        return res.status(500).json({ message: "System error!" });
    }
};

export const getAllFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const populateFields = "_id username displayName avatarUrl";
        const [sent, received] = await Promise.all([
            FriendRequest.find({ from: userId }).populate("to", populateFields),// get data (id, username, displayName, avatarUrl) of user who received friend requests
            FriendRequest.find({ to: userId }).populate("from", populateFields),// get data (id, username, displayName, avatarUrl) of user who sent friend requests
        ]);

        return res.status(200).json({ sent, received });
    } catch (error) {
        console.error("Error when calling get all friend requests", error);
        return res.status(500).json({ message: "System error!" });
    }
};