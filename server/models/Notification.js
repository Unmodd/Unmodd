import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['mention', 'reply', 'post_vote', 'comment_vote', 'new_post', 'follow'],
        required: true
    },
    postId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', 
        required: false
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: false
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model("Notification", notificationSchema);