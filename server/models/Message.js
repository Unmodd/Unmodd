import mongoose from 'mongoose';

const MessageSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: { 
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    }
});

export default mongoose.model('Message', MessageSchema);