

import Comment from '../models/Comments.js'; 
import User from '../models/auth.js';       
import Post from '../models/Posts.js';       
import Notification from '../models/Notification.js'; 
import { addXP, completeTaskByCriteria } from './gamification.js'; 


export const postComment = async (req, res) => {
    const { postId } = req.params; 
    const { userId, commentBody, userCommented } = req.body;


    if (!userId || !commentBody || !userCommented) {
        return res.status(400).json({ message: "Missing required fields: userId, commentBody, userCommented." });
    }

    try {

        const newStandaloneComment = new Comment({
            postId,
            userId,
            commentBody,
            userCommented,
            commentedOn: new Date(),
        });
        await newStandaloneComment.save();
        console.log(`[postComment] Standalone comment saved: ${newStandaloneComment._id}`);


        const postToUpdate = await Post.findById(postId);

        if (postToUpdate) {

            const embeddedComment = {
                _id: newStandaloneComment._id, 
                commentBody,
                userCommented,
                userId,
                commentedOn: new Date(),
            };

            postToUpdate.comment.push(embeddedComment); 
            postToUpdate.noOfComments = postToUpdate.comment.length; 
            await postToUpdate.save();
            console.log(`[postComment] Post ${postId} updated with new embedded comment and count.`);


            const mentionRegex = /@(\w+)/g; 
            let match;
            const mentionedUsernames = new Set(); 

            while ((match = mentionRegex.exec(commentBody)) !== null) {
                if (match[1]) { 
                    mentionedUsernames.add(match[1]);
                }
            }
            console.log(`[postComment] Detected mentions: ${Array.from(mentionedUsernames).join(', ')}`);

            if (mentionedUsernames.size > 0) {

                const usersToNotify = await User.find({ name: { $in: Array.from(mentionedUsernames) } });

                for (const mentionedUser of usersToNotify) {


                    if (mentionedUser._id.toString() !== userId.toString()) {
                        await Notification.create({
                            recipient: mentionedUser._id,
                            sender: userId,
                            type: 'mention',
                            postId: postId,
                            commentId: newStandaloneComment._id, 
                            message: `${userCommented} mentioned you in a comment on "${postToUpdate.postTitle}".`, 
                        });
                        console.log(`[postComment] Notification created for ${mentionedUser.name} (${mentionedUser._id})`);
                    } else {
                        console.log(`[postComment] Skipping self-mention notification for ${mentionedUser.name}.`);
                    }
                }
            }




            const user = await User.findById(userId);
            if (user) {
                user.commentsCount = (user.commentsCount || 0) + 1; 
                user.dailyCommentsCount = (user.dailyCommentsCount || 0) + 1; 
                console.log(`[postComment] User ${user.email} total comments: ${user.commentsCount}, daily comments: ${user.dailyCommentsCount}`);


                if (user.dailyCommentsCount >= 3) {
                    await completeTaskByCriteria(userId, 'comment_3_posts');
                    console.log(`[postComment] Checked and possibly completed 'comment_3_posts' for user ${userId}.`);
                } else {
                    console.log(`[postComment] User ${userId} needs ${3 - user.dailyCommentsCount} more comments for 'comment_3_posts' task.`);
                }
                await user.save(); 
            } else {
                console.warn(`[postComment] User not found for ID: ${userId}. Gamification counts skipped.`);
            }



            res.status(201).json({
                message: "Comment added successfully",
                comment: embeddedComment 
            });

        } else {

            await Comment.findByIdAndDelete(newStandaloneComment._id);
            return res.status(404).json({ message: "Parent Post not found. Comment not saved." });
        }

    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Failed to add comment", error: error.message });
    }
};


export const deleteComment = async (req, res) => {
    const { id } = req.params; 
    const { postId } = req.body; 

    try {

        const deletedStandaloneComment = await Comment.findByIdAndDelete(id);
        if (!deletedStandaloneComment) {
            return res.status(404).json({ message: "Standalone comment not found." });
        }
        console.log(`[deleteComment] Standalone comment ${id} deleted.`);


        const postToUpdate = await Post.findById(postId); 

        if (postToUpdate) {

            postToUpdate.comment = postToUpdate.comment.filter(
                (com) => com._id.toString() !== id
            );
            postToUpdate.noOfComments = postToUpdate.comment.length;
            await postToUpdate.save();
            console.log(`[deleteComment] Post ${postId} updated after embedded comment removal.`);




            res.status(200).json({ message: "Comment deleted successfully" });
        } else {
            console.warn(`[deleteComment] Parent Post for comment ${id} not found. Standalone comment deleted, but post not updated.`);
            res.status(404).json({ message: "Parent post not found, but comment deleted." });
        }

    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Failed to delete comment", error: error.message });
    }
};