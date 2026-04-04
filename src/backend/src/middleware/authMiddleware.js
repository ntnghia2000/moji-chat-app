import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// User authorization
export const protectedRoute = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Token not found!" });
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (error, decodedUser) => {
            if (error) {
                console.error(error);
                return res.status(403).json({ message: "Access token has been expired or incorrect!" });
            }
            const user = await User.findById(decodedUser.userId).select('-hashedPassword'); //Get all user's information inspect password.
            if (!user) {
                return res.status(404).json({ message: "User doesn't exist" });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("Fail to authorize JWT in authMiddleware", error);
        return res.status(500).json({ message: "System error!" });
    }
}