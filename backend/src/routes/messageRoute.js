import express from 'express';
import { sendDirectMessage, sendGroupMessage } from '../controllers/messageController.js';
import { checkFriendship, checkGroupMember } from '../middleware/friendMiddleware.js';

const router = express.Router();
router.post('/direct', checkFriendship, sendDirectMessage);
router.post('/group', checkGroupMember, sendGroupMessage);

export default router;