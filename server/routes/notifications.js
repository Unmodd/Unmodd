
import express from 'express';
import auth from '../middleware/auth.js'; 
import { getMyNotifications, markNotificationsAsRead, getUnreadNotificationCount } from '../controllers/notifications.js';


const router = express.Router();

router.get('/', auth, getMyNotifications);
router.put('/mark-read', auth, markNotificationsAsRead);
router.get('/unread-count', auth, getUnreadNotificationCount);

export default router;