import { uploadImageFromBuffer } from "../middleware/uploadMiddleware.js";
import User from "../models/user.js";

export const authMe = async (req, res) => {
    try {
        const user = req.user; // got user from auth middleware.
        return res.status(200).json({
            user
        });
    } catch (error) {
        console.error("Error when calling authMe", error);
        return res.status(500).json({ message: "System error!" });
    }
}

export const test = async (req, res) => {
    return res.sendStatus(204)
}

export const searchUserByUserName = async (req, res) => {
    try {
        const { username } = req.query;
        if (!username || username.trim() == "") {
            return res.status(400).json({ message: "Please provide user name." });
        }
        const user = await User.findOne({username}).select("_id displayName username avatarUrl");
        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error while searching user by user name.", error);
        return res.status(500).json({ message: "System error!" });
    }
}

export const uploadAvatar = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user._id;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded!" });
        }
        const result = await uploadImageFromBuffer(file.buffer);
        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                avatarUrl: result.secure_url,
                avatarId: result.public_id,
            }, {
                new: true
            }
        ).select("avatarUrl");

        if (!updatedUser.avatarUrl) {
            return res.status(400).json({ message: "Avatar return null" });
        }
        return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
    } catch (error) {
        console.error("Error while uploading avatar url", error);
        return res.status(500).json({ message: "Avatar upload failed." });
    }
}