import bcrypt from 'bcrypt';
import User from '../models/user.js';
import Session from '../models/session.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_TTL = '30m'
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export const signUp = async (req, res) => {
    try {
        const { email, password, username, firstName, lastName } = req.body;
        if (!username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({
                message: "The information is missing!",
            });
        }

        const isDuplicated = await User.findOne({username});
        if (isDuplicated) {
            return res.status(409).json({
                message: "User existed!",
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username, 
            hashedPassword, 
            email, 
            displayName: `${lastName} ${firstName}`
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error("Error when trying to sign up!", error);

        return res.status(500).json({
            message: "System error!",
        });
    }
};

export const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "The information is missing!",
            });
        }

        const user = await User.findOne({username});
        if (!user) {
            return res.status(401).json({
                message: "User name or password is incorrect!",
            });
        }

        const isCorrectPassword = await bcrypt.compare(password, user.hashedPassword);
        if (!isCorrectPassword) {
            return res.status(401).json({
                message: "User name or password is incorrect!",
            });
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        )

        const refreshToken = crypto.randomBytes(64).toString('hex');
        // create session to save refresh token
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL)
        });

        // inject refresh token into cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            samesite: 'none',
            maxAge: REFRESH_TOKEN_TTL
        });

        return res.status(200).json({message: `User ${user.displayName} logged in`, accessToken});

    } catch (error) {
        console.error("Error when trying to sign in!", error);

        return res.status(500).json({
            message: "System error!",
        });
    }
};

export const signOut = async (req, res) => {
    try {
        // get refresh token
        const token = req.cookies?.refreshToken;
        if (token) {
            await Session.deleteOne({ refreshToken: token });
            res.clearCookie("refreshToken");
        }
        return res.sendStatus(204);
        
    } catch (error) {
        console.error("Error when trying to sign out!", error);

        return res.status(500).json({
            message: "System error!",
        });
    }
};

export const refresh = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({
                message: "Token does not exist!",
            });
        }
        const session = await Session.findOne({ refreshToken: token });
        if (!session) {
            return res.status(403).json({
                message: "Token is valid!",
            });
        }
        if (session.expiresAt < new Date()) {
            return res.status(403).json({
                message: "Token has expired!",
            });
        }
        const accessToken = jwt.sign(
            { userId: Session.userId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        )
        return res.status(200).json({accessToken});
        
    } catch (error) {
        console.error("Error when trying to refresh token!", error);

        return res.status(500).json({
            message: "System error!",
        });
    }
};