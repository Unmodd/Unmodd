
import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
    commentBody: {
        type: String,
        required: true
    },
    userCommented: { 
        type: String,
        required: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    postId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts', 
        required: true
    },
    commentedOn: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model("Comment", commentSchema);