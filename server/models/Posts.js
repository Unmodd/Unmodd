

import mongoose from 'mongoose'

const PostSchema = mongoose.Schema({
    postTitle: { type: String, required: "Post must have a title" },
    postBody: { type: String, required: "Post must have a Body" },
    postTags: { type: [String], required: "Post must have a tags" },
    mediaUrls: [{ type: String }],
    category: { type: String, required: true },
    noOfComments: { type: Number, default: 0 },
    upVote: { type: [String], default: [] },
    downVote: { type: [String], default: [] },
    userPosted: { type: String, required: "Post must have an author" },
    userId: { type: String },
    pinned: { type: Boolean, default: false, },
    postedOn: { type: Date, default: Date.now },
    comment: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        commentBody: String,
        userCommented: String,
        userId: String,
        commentedOn: { type: Date, default: Date.now },
    }]
})

export default mongoose.model("Post", PostSchema)