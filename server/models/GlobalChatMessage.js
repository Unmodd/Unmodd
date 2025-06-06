
import mongoose from 'mongoose';

const GlobalChatMessageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    senderName: { 
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('GlobalChatMessage', GlobalChatMessageSchema);