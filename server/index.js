import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import cron from 'node-cron';


import uploadRoutes from './routes/upload.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/Posts.js';
import commentRoutes from './routes/Comments.js';
import cryptoRoutes from './routes/crypto.js';
import messageRoutes from './routes/messages.js'; 
import notificationRoutes from './routes/notifications.js'; 
import { assignDailyTasksToAllUsers, completeTaskByCriteria } from './controllers/gamification.js'; 
import User from './models/auth.js'; 


import connectDB from './connectMongoDb.js'; 
import GlobalChatMessage from './models/GlobalChatMessage.js';
import Message from './models/Message.js'; 

dotenv.config();
connectDB(); 

const app = express();
const httpServer = http.createServer(app);


const io = new Server(httpServer, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

const userSocketMap = new Map(); 


cron.schedule('* * * * *', async () => {
    console.log('Running daily task assignment cron job...');
    await assignDailyTasksToAllUsers();
}, {
    timezone: "Asia/Kolkata" 
});


io.on('connection', (socket) => {
    console.log('New Socket.IO connection:', socket.id);


    socket.on('join', async (userId) => {
        if (!userId) {
            console.warn(`Attempted to join with undefined userId from socket ${socket.id}`);
            return;
        }

        socket.join(userId); 
        userSocketMap.set(userId, socket.id); 

        const onlineUsers = Array.from(userSocketMap.keys());
        io.emit('onlineUsers', onlineUsers); 
        console.log(`User ${userId} joined. Current online users:`, onlineUsers);


        try {
            const undeliveredMessages = await Message.find({
                receiverId: userId,
                status: 'sent' 
            }).sort({ timestamp: 1 }); 

            if (undeliveredMessages.length > 0) {
                console.log(`Delivering ${undeliveredMessages.length} undelivered messages to ${userId}.`);
                for (const msg of undeliveredMessages) {
                    io.to(socket.id).emit('private_message', msg);
                    msg.status = 'delivered';
                    await msg.save();
                }
            }
        } catch (error) {
            console.error(`Error fetching/delivering undelivered messages for ${userId}:`, error);
        }
    });


    socket.on('global message', async ({ userId, userName, text }) => {
        console.log(`Received global message from ${userName} (${userId}): "${text}"`);
        
        try {
            const newGlobalMessage = new GlobalChatMessage({
                sender: userId,
                senderName: userName,
                text: text
            });
            const savedGlobalMessage = await newGlobalMessage.save(); 


            io.emit('global message', {
                _id: savedGlobalMessage._id,
                senderId: savedGlobalMessage.sender, 
                senderName: savedGlobalMessage.senderName,
                text: savedGlobalMessage.text,
                timestamp: savedGlobalMessage.timestamp
            });
            console.log("Global message saved and broadcasted.");




            const normalizedMessage = text.trim().toLowerCase();

            if (normalizedMessage === 'gm') {
                const user = await User.findById(userId); 
                if (user) {


                    if (!user.hasSaidGmToday) { 
                        console.log(`[GM Task] User ${user.username} said "GM". Updating hasSaidGmToday flag.`);
                        user.hasSaidGmToday = true; 
                        await user.save(); 
                        
                        console.log(`[GM Task] Attempting to complete 'say_gm_in_chat' for user ${user.username}.`);
                        await completeTaskByCriteria(userId, 'say_gm_in_chat');
                    } else {
                        console.log(`[GM Task] User ${user.username} already said "GM" today. Task not re-completed.`);
                    }
                } else {
                    console.warn(`[GM Task] User not found for userId: ${userId} when processing GM message.`);
                }
            }




        } catch (error) {
            console.error("Error saving or broadcasting global chat message or processing GM task:", error);
        }
    });


    socket.on('private_message', async ({ senderId, receiverId, message }) => {
        if (!senderId || !receiverId || !message) {
            console.warn("Invalid private message payload received:", { senderId, receiverId, message });
            socket.emit('message_error', { error: 'Invalid message payload' });
            return;
        }
        console.log(`Received private message: From ${senderId} To ${receiverId}: "${message}"`);

        let savedMessage; 


        try {
            const newMessage = new Message({
                senderId,
                receiverId,
                message,
                status: 'sent' 
            });
            savedMessage = await newMessage.save(); 
            console.log("Private message saved to DB.");
        } catch (error) {
            console.error("Error saving private message to database:", error);
            socket.emit('message_error', { recipientId: receiverId, error: 'Failed to save message' });
            return; 
        }


        const receiverSocketId = userSocketMap.get(receiverId);

        if (receiverSocketId) {
            console.log(`Attempting to send to receiver socket: ${receiverSocketId}`);
            io.to(receiverSocketId).emit('private_message', savedMessage);
            
            try {
                savedMessage.status = 'delivered';
                await savedMessage.save();
                console.log(`Private message delivered instantly to ${receiverId}`);
            } catch (updateError) {
                console.error(`Error updating message status to 'delivered' for ${savedMessage._id}:`, updateError);
            }
        } else {
            console.log(`Receiver ${receiverId} is offline. Message saved for later delivery.`);
            socket.emit('private_message_status', {
                success: true, 
                receiverId,
                message: 'Recipient is offline, message will be delivered when they come online.'
            });
        }
    });


    socket.on('typing', ({ from, to }) => {
        const toSocketId = userSocketMap.get(to);
        if (toSocketId) {
            io.to(toSocketId).emit('typing', { from });
        }
    });


    socket.on('readMessage', async ({ readerId, messageId }) => {
        try {
            const messageToUpdate = await Message.findById(messageId);
            if (messageToUpdate && messageToUpdate.receiverId.toString() === readerId) {
                messageToUpdate.status = 'read';
                await messageToUpdate.save();
                console.log(`Message ${messageId} marked as read by ${readerId}.`);

                const senderSocketId = userSocketMap.get(messageToUpdate.senderId.toString());
                if (senderSocketId) {
                    io.to(senderSocketId).emit('messageRead', { messageId, readerId });
                }
            }
        } catch (error) {
            console.error(`Error marking message ${messageId} as read:`, error);
        }
    });


    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);

        let disconnectedUserId = null;
        for (let [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                userSocketMap.delete(userId); 
                break;
            }
        }

        if (disconnectedUserId) {
            const onlineUsers = Array.from(userSocketMap.keys());
            io.emit('onlineUsers', onlineUsers); 
            console.log(`User ${disconnectedUserId} disconnected. Remaining online users:`, onlineUsers);
        }
    });
}); 

app.set('io', io); 






app.use(express.json({ limit: '30mb', extended: true })); 
app.use(express.urlencoded({ limit: '30mb', extended: true })); 
app.use(cookieParser()); 
app.use(cors()); 


app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes); 
app.use('/api/crypto', cryptoRoutes);
app.use('/posts', postRoutes); 
app.use('/comment', commentRoutes); 
app.use('/notifications', notificationRoutes);


app.get('/api/globalchat/history', async (req, res) => {
    try {
        const messages = await GlobalChatMessage.find()
            .sort({ timestamp: 1 })
            .limit(100); 
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching global chat history:", error);
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
});


const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});