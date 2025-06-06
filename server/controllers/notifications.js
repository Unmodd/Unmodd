
import Notification from '../models/Notification.js';
import User from '../models/auth.js'; 
import Post from '../models/Posts.js'; 
import mongoose from 'mongoose';



export const createNotification = async ({ recipientId, senderId, type, content, relatedEntityId, relatedEntityType, postId, commentId }) => { 
    try {

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            console.warn(`[createNotification] Recipient user not found for ID: ${recipientId}. Notification not created.`);
            return;
        }



        const newNotification = new Notification({
            recipient: recipientId, 
            sender: senderId || null, 
            type,
            message: content, 
            relatedEntityId,
            relatedEntityType,
            postId: postId || null,   
            commentId: commentId || null, 
            createdAt: new Date().toISOString()
        });

        await newNotification.save();
        console.log(`[createNotification] Notification created for user ${recipientId}, type: ${type}`);

    } catch (error) {
        console.error(`[createNotification] ERROR creating notification:`, error);
    }
};


export const getMyNotifications = async (req, res) => {
    const userId = req.userId; 

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized. Please login to fetch notifications." });
    }

    try {
        const notifications = await Notification.find({ recipient: userId }) 
            .sort({ createdAt: -1 }) 
            .populate('sender', 'username profilePicture') 
            .populate('postId', 'postTitle') 
            .limit(50); 

        res.status(200).json(notifications);
    } catch (error) {
        console.error(`[getMyNotifications] ERROR fetching notifications for user ${userId}:`, error);
        res.status(500).json({ message: "Error fetching notifications." });
    }
};


export const markNotificationsAsRead = async (req, res) => {
    const { notificationIds } = req.body; 
    const userId = req.userId; 

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
    }
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ message: "No notification IDs provided." });
    }

    try {

        const result = await Notification.updateMany(
            { _id: { $in: notificationIds }, recipient: userId }, 
            { $set: { read: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "No matching notifications found for this user." });
        }

        res.status(200).json({ message: `${result.modifiedCount} notifications marked as read.` });
    } catch (error) {
        console.error(`[markNotificationsAsRead] ERROR marking notifications as read:`, error);
        res.status(500).json({ message: "Error marking notifications as read." });
    }
};


export const getUnreadNotificationCount = async (req, res) => {
    const userId = req.userId; 

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized." });
    }

    try {
        const count = await Notification.countDocuments({ recipient: userId, read: false });

        console.log(`[getUnreadNotificationCount] Querying for recipient: ${userId}, read: false`);
        console.log(`[getUnreadNotificationCount] Found unread count: ${count}`);

        res.status(200).json({ count });
    } catch (error) {
        console.error(`[getUnreadNotificationCount] ERROR getting unread count for user ${userId}:`, error);
        res.status(500).json({ message: "Error fetching unread count." });
    }
};