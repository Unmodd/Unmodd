

import Posts from '../models/Posts.js';
import mongoose from 'mongoose';
import User from '../models/auth.js'; 
import Notification from '../models/Notification.js'; 
import { createNotification } from './notifications.js'; 
import DailyTaskTemplate from '../models/dailyTaskTemplate.js';
import { addXP, checkAndAwardAchievements, completeTaskByCriteria } from './gamification.js';


const extractMentions = (text) => {
    const mentionRegex = /@([a-zA-Z0-9_.]+)/g; 
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1]); 
    }
    return [...new Set(mentions)]; 
};

export const CreatePost = async (req, res) => {
    console.log(`\n--- [CreatePost] START ---`);
    const { postTitle, postBody, postTags, mediaUrls, userPosted, userId, category } = req.body;
    const currentUserId = req.userId; 

    if (!category) {
        console.error(`[CreatePost] ERROR: Category is missing from request body.`);
        return res.status(400).json({ message: "Post category is required." });
    }

    console.log(`[CreatePost] Request received from user ID: ${currentUserId}, Post Data:`, req.body);

    const postPost = new Posts({
        postTitle,
        postBody,
        postTags,
        mediaUrls,
        userPosted,
        userId: currentUserId, 
        category,
        postedOn: new Date().toISOString()
    });

    try {
        await postPost.save();
        console.log(`[CreatePost] Post successfully saved with ID: ${postPost._id}, Category: ${postPost.category}`);
        res.status(200).json("Posted successfully");


        const combinedText = `${postTitle} ${postBody}`;
        const mentionedUsernames = extractMentions(combinedText);
        console.log(`[CreatePost] Extracted mentions:`, mentionedUsernames);

        if (mentionedUsernames.length > 0) {
            const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } }, '_id username');
            console.log(`[CreatePost] Found mentioned users:`, mentionedUsers.map(u => u.username));

            for (const mentionedUser of mentionedUsers) {

                if (mentionedUser._id.toString() !== currentUserId) {
                    await createNotification(
                        mentionedUser._id, 
                        currentUserId, 
                        'mention', 
                        `You were mentioned in a post by ${userPosted}: "${postTitle.substring(0, 50)}..."`, 
                        `/posts/${postPost._id}` 
                    );
                    console.log(`[CreatePost] Created mention notification for ${mentionedUser.username}`);
                } else {
                    console.log(`[CreatePost] Skipping self-mention notification for user ${mentionedUser.username}.`);
                }
            }
        }




        const user = await User.findById(currentUserId);
        if (user) {
            console.log(`[CreatePost] User found: ${user.email}`);
            const oldPostsCount = user.postsCount || 0;
            user.postsCount = oldPostsCount + 1;


            user.weeklyPostsCount = (user.weeklyPostsCount || 0) + 1;
            console.log(`[CreatePost] User ${user.email} postsCount updated to ${user.postsCount}. weeklyPostsCount updated to ${user.weeklyPostsCount}.`);


            const createPostTaskTemplate = await DailyTaskTemplate.findOne({ criteria: 'create_post_any_type', type: 'weekly' });
            if (createPostTaskTemplate && user.weeklyPostsCount <= createPostTaskTemplate.maxCompletions) {
                await completeTaskByCriteria(currentUserId, 'create_post_any_type');
                console.log(`[CreatePost] Checked 'create_post_any_type' for user ${currentUserId}.`);
            } else if (!createPostTaskTemplate) {
                console.warn(`[CreatePost] Warning: 'create_post_any_type' weekly task template not found.`);
            } else {
                console.log(`[CreatePost] User ${currentUserId} has reached max completions (${createPostTaskTemplate.maxCompletions}) for 'create_post_any_type' this week.`);
            }


            if (req.body.type === 'moonshot' || req.body.isMoonshot) {
                user.weeklyMoonshotsCount = (user.weeklyMoonshotsCount || 0) + 1;
                console.log(`[CreatePost] User ${user.email} weeklyMoonshotsCount updated to ${user.weeklyMoonshotsCount}.`);

                const moonshotTaskTemplate = await DailyTaskTemplate.findOne({ criteria: 'post_moonshot_10x', type: 'weekly' });
                if (moonshotTaskTemplate && user.weeklyMoonshotsCount <= moonshotTaskTemplate.maxCompletions) {
                    await completeTaskByCriteria(currentUserId, 'post_moonshot_10x');
                    console.log(`[CreatePost] Checked 'post_moonshot_10x' for user ${currentUserId}.`);
                } else if (!moonshotTaskTemplate) {
                    console.warn(`[CreatePost] Warning: 'post_moonshot_10x' weekly task template not found.`);
                } else {
                    console.log(`[CreatePost] User ${currentUserId} has reached max completions (${moonshotTaskTemplate.maxCompletions}) for 'post_moonshot_10x' this week.`);
                }
            }

            await user.save();
            console.log(`[CreatePost] User ${user.email} document saved.`);

            await checkAndAwardAchievements(currentUserId, 'create_post');
            console.log(`[CreatePost] Checked achievements for user ${currentUserId} after creating post.`);
        } else {
            console.warn(`[CreatePost] User not found for ID: ${currentUserId} after post creation. Gamification skipped.`);
        }
        console.log(`--- [CreatePost] END ---`);

    } catch (error) {
        console.error(`[CreatePost] ERROR creating post for user ${currentUserId}:`, error);
        res.status(409).json("Couldn't post a new post");
        console.log(`--- [CreatePost] END ---`);
    }
};

export const getAllPosts = async (req, res) => {
    console.log(`\n--- [getAllPosts] START ---`);
    try {
        const postList = await Posts.find().sort({ postedOn: -1 });
        console.log(`[getAllPosts] Found ${postList.length} posts.`);
        res.status(200).json(postList);
        console.log(`--- [getAllPosts] END ---`);
    } catch (error) {
        console.error(`[getAllPosts] ERROR fetching all posts:`, error);
        res.status(404).json({ message: error.message });
        console.log(`--- [getAllPosts] END ---`);
    }
};

export const deletePost = async (req, res) => {
    console.log(`\n--- [deletePost] START ---`);
    const { id: _id } = req.params;
    console.log(`[deletePost] Request to delete post ID: ${_id}`);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        console.error(`[deletePost] ERROR: Invalid Post ID: ${_id}`);
        return res.status(404).send('Post unavailable...');
    }

    try {
        const postToDelete = await Posts.findById(_id);
        if (!postToDelete) {
            console.warn(`[deletePost] Post not found for ID: ${_id}.`);
            return res.status(404).json({ message: "Post not found." });
        }

        if (postToDelete.userId) {
            console.log(`[deletePost] Post owner is ${postToDelete.userId}. Decrementing postsCount for this user.`);
            const user = await User.findById(postToDelete.userId);
            if (user) {
                user.postsCount = Math.max(0, (user.postsCount || 0) - 1);
                await user.save();
                console.log(`[deletePost] User ${user.email} postsCount decremented to ${user.postsCount}.`);
            }
        }

        await Posts.findByIdAndRemove(_id);
        console.log(`[deletePost] Post ${_id} successfully deleted from DB.`);
        res.status(200).json({ message: "successfully deleted..." });
        console.log(`--- [deletePost] END ---`);
    } catch (error) {
        console.error(`[deletePost] ERROR deleting post ${_id}:`, error);
        res.status(404).json({ message: error.message });
        console.log(`--- [deletePost] END ---`);
    }
};

export const votePost = async (req, res) => {
    console.log(`\n--- [votePost] START ---`);
    const { id: _id } = req.params;
    const { value } = req.body;
    const userId = req.userId; 

    console.log(`[votePost] Request received: Post ID: ${_id}, Vote Value: ${value}, by User ID: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        console.error(`[votePost] ERROR: Invalid Post ID: ${_id}`);
        return res.status(404).send('Post unavailable...');
    }
    if (!userId) {
        console.error(`[votePost] ERROR: Unauthorized - User ID is missing.`);
        return res.status(401).json({ message: "Unauthorized. Please login to vote." });
    }

    try {
        const post = await Posts.findById(_id);
        const user = await User.findById(userId);

        if (!post) {
            console.error(`[votePost] ERROR: Post not found for ID: ${_id}`);
            return res.status(404).json({ message: "Post not found." });
        }
        if (!user) {
            console.error(`[votePost] ERROR: User not found for ID: ${userId}`);
            return res.status(404).json({ message: "User not found." });
        }
        console.log(`[votePost] Found Post (title: ${post.postTitle}) and User (email: ${user.email}).`);


        if (!post.upVote) { post.upVote = []; }
        if (!post.downVote) { post.downVote = []; }

        const upIndex = post.upVote.findIndex((id) => id === String(userId));
        const downIndex = post.downVote.findIndex((id) => id === String(userId));

        console.log(`[votePost] Initial vote state for user ${userId}: upIndex=${upIndex}, downIndex=${downIndex}`);

        if (value === 'upVote') {
            console.log(`[votePost] Handling an UPVOTE action.`);
            if (downIndex !== -1) {
                post.downVote = post.downVote.filter((id) => id !== String(userId));
                console.log(`[votePost] Removed existing downvote from user ${userId}.`);
            }

            if (upIndex === -1) { 
                post.upVote.push(userId);
                console.log(`[votePost] User ${userId} successfully UPVOTED post ${_id}.`);


                if (post.userId.toString() !== userId) {

                    user.likesGivenCount = (user.likesGivenCount || 0) + 1;


                    user.dailyUpvotesCount = (user.dailyUpvotesCount || 0) + 1;
                    console.log(`[votePost] User ${user.email} dailyUpvotesCount: ${user.dailyUpvotesCount}`);


                    if (user.dailyUpvotesCount >= 5) {
                        await completeTaskByCriteria(userId, 'upvote_5_posts');
                        console.log(`[votePost] Checked 'upvote_5_posts' for user ${userId}.`);
                    } else {
                        console.log(`[votePost] User ${userId} needs ${5 - user.dailyUpvotesCount} more upvotes for 'upvote_5_posts' task.`);
                    }

                    const xpAwarded = 2; 
                    await addXP(userId, xpAwarded); 
                    console.log(`[votePost] Awarded ${xpAwarded} XP to user ${userId}.`);


                    if (post.upVote.length >= 50) { 
                        console.log(`[votePost] Post reached 50 upvotes. Checking 'post_liked_by_others' achievement for owner ${post.userId}.`);
                        await checkAndAwardAchievements(post.userId, 'post_liked_by_others');
                    }


                    if (post.userId.toString() !== userId) { 
                        await createNotification(
                            post.userId, 
                            userId, 
                            'upvote', 
                            `${user.username} upvoted your post: "${post.postTitle.substring(0, 50)}..."`, 
                            `/posts/${post._id}` 
                        );
                        console.log(`[votePost] Created upvote notification for post owner ${post.userId}.`);
                    }


                } else {
                    console.log(`[votePost] User ${userId} upvoted their own post. No XP or daily task completion for this action.`);
                }
            } else { 
                post.upVote = post.upVote.filter((id) => id !== String(userId));
                console.log(`[votePost] User ${userId} UNDID their upvote on post ${_id}.`);

                if (post.userId.toString() !== userId) {
                    user.likesGivenCount = Math.max(0, (user.likesGivenCount || 0) - 1);
                }
            }
        } else if (value === 'downVote') {
            console.log(`[votePost] Handling a DOWNVOTE action.`);
            if (upIndex !== -1) { 
                post.upVote = post.upVote.filter((id) => id !== String(userId));
                console.log(`[votePost] Removed existing upvote from user ${userId}.`);

                if (post.userId.toString() !== userId) {
                    user.likesGivenCount = Math.max(0, (user.likesGivenCount || 0) - 1);
                }
            }

            if (downIndex === -1) { 
                post.downVote.push(userId);
                console.log(`[votePost] User ${userId} successfully DOWNVOTED post ${_id}.`);
            } else { 
                post.downVote = post.downVote.filter((id) => id !== String(userId));
                console.log(`[votePost] User ${userId} UNDID their downvote on post ${_id}.`);
            }
        }

        const updatedPost = await Posts.findByIdAndUpdate(_id, post, { new: true });
        await user.save(); 
        console.log(`[votePost] Post ${_id} updated in DB. Final upVote count: ${updatedPost.upVote.length}, downVote count: ${updatedPost.downVote.length}.`);
        res.status(200).json(updatedPost);
        console.log(`--- [votePost] END ---`);

    } catch (error) {
        console.error(`[votePost] FATAL ERROR during votePost for post ${_id}, user ${userId}:`, error);
        res.status(500).json({ message: "Something went wrong while voting." });
        console.log(`--- [votePost] END ---`);
    }
};

export const pinPost = async (req, res) => {
    console.log(`\n--- [pinPost] START ---`);
    const { id: postId } = req.params;
    const userId = req.userId; 
    console.log(`[pinPost] Request for Post ID: ${postId} by User ID: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        console.error(`[pinPost] ERROR: Invalid Post ID: ${postId}`);
        return res.status(404).send('Post unavailable...');
    }

    try {
        const post = await Posts.findById(postId);
        if (!post) {
            console.error(`[pinPost] Post not found for ID: ${postId}.`);
            return res.status(404).json({ message: "Post not found" });
        }
        console.log(`[pinPost] Found Post (title: ${post.postTitle}).`);

        if (post.userId.toString() !== userId) {
            console.warn(`[pinPost] Unauthorized: User ${userId} tried to pin post ${postId} which belongs to ${post.userId}.`);
            return res.status(403).json({ message: "You can only pin your own posts." });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error(`[pinPost] User not found for ID: ${userId}.`);
            return res.status(404).json({ message: "User not found." });
        }
        console.log(`[pinPost] Found User: ${user.email}.`);


        const pinTaskTemplate = await DailyTaskTemplate.findOne({ criteria: 'pin_post', type: 'daily' }); 
        const cost = pinTaskTemplate ? Math.abs(pinTaskTemplate.xpReward) : 10; 
        console.log(`[pinPost] Pin cost for 'pin_post' task template: ${cost} XP.`);

        if (!post.pinned) { 
            console.log(`[pinPost] Attempting to PIN post ${postId}. Current user XP: ${user.xp}. Required: ${cost}`);
            if (user.xp < cost) {
                console.warn(`[pinPost] Not enough XP for user ${userId}. Required: ${cost}, Has: ${user.xp}`);
                return res.status(400).json({ message: `Not enough XP to pin. Requires ${cost} XP.` });
            }
            user.xp -= cost; 
            post.pinned = true;
            console.log(`[pinPost] Post ${postId} marked as pinned. User ${userId} new XP: ${user.xp}`);






        } else { 
            console.log(`[pinPost] Attempting to UNPIN post ${postId}.`);
            post.pinned = false; 

            console.log(`[pinPost] Post ${postId} marked as unpinned.`);
        }

        await user.save(); 
        await post.save(); 

        res.status(200).json({ message: `Post ${post.pinned ? 'pinned' : 'unpinned'} successfully. Your XP: ${user.xp}` });
        console.log(`--- [pinPost] END ---`);
    } catch (error) {
        console.error(`[pinPost] FATAL ERROR pinning/unpinning post ${postId}:`, error);
        res.status(500).json({ message: error.message });
        console.log(`--- [pinPost] END ---`);
    }
};

export const boostUpvotes = async (req, res) => {
    console.log(`\n--- [boostUpvotes] START ---`);
    const { id } = req.params;
    const { amount } = req.body;
    const adminId = req.userId;
    console.log(`[boostUpvotes] Request to boost post ID: ${id} by ${amount} upvotes from Admin ID: ${adminId}`);


    if (adminId !== process.env.ADMIN_ID) {
        console.warn(`[boostUpvotes] Unauthorized attempt: User ${adminId} is not the Admin (${process.env.ADMIN_ID}).`);
        return res.status(403).json({ message: "Only admin can boost upvotes." });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(`[boostUpvotes] ERROR: Invalid Post ID: ${id}`);
        return res.status(404).send('Post unavailable...');
    }

    try {
        const post = await Posts.findById(id);
        if (!post) {
            console.error(`[boostUpvotes] Post not found for ID: ${id}.`);
            return res.status(404).json({ message: "Post not found." });
        }
        console.log(`[boostUpvotes] Found Post (title: ${post.postTitle}).`);


        if (!post.upVote) {
            post.upVote = [];
        }


        for (let i = 0; i < amount; i++) {
            post.upVote.push(new mongoose.Types.ObjectId()); 
        }
        console.log(`[boostUpvotes] Added ${amount} fake upvotes. Total now: ${post.upVote.length}.`);

        await post.save();
        res.status(200).json({ message: `Boosted ${amount} upvotes. Post now has ${post.upVote.length} upvotes.` });
        console.log(`--- [boostUpvotes] END ---`);
    } catch (error) {
        console.error(`[boostUpvotes] FATAL ERROR boosting upvotes for post ${id}:`, error);
        res.status(500).json({ message: error.message });
        console.log(`--- [boostUpvotes] END ---`);
    }
};



export const addComment = async (req, res) => {
    console.log(`\n--- [addComment] START ---`);
    const { id: postId } = req.params; 
    const { commentBody, userCommented, userId } = req.body; 
    const currentUserId = req.userId; 

    console.log(`[addComment] Request received for Post ID: ${postId} by User ID: ${currentUserId}`);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        console.error(`[addComment] ERROR: Invalid Post ID: ${postId}`);
        return res.status(404).send('Post unavailable...');
    }
    if (!currentUserId) {
        console.error(`[addComment] ERROR: Unauthorized - User ID is missing.`);
        return res.status(401).json({ message: "Unauthorized. Please login to comment." });
    }

    try {
        const post = await Posts.findById(postId);
        if (!post) {
            console.error(`[addComment] Post not found for ID: ${postId}.`);
            return res.status(404).json({ message: "Post not found." });
        }
        console.log(`[addComment] Found Post (title: ${post.postTitle}).`);

        const newComment = {
            commentBody,
            userCommented,
            userId: currentUserId,
            commentedOn: new Date().toISOString()
        };

        post.noOfComments = (post.noOfComments || 0) + 1;
        post.comment.push(newComment);
        await post.save();
        console.log(`[addComment] Comment added to post ${postId}.`);


        const commentingUser = await User.findById(currentUserId);
        if (commentingUser) {
            commentingUser.commentsCount = (commentingUser.commentsCount || 0) + 1;
            await commentingUser.save();
            console.log(`[addComment] User ${commentingUser.email} commentsCount updated to ${commentingUser.commentsCount}.`);
            await checkAndAwardAchievements(currentUserId, 'add_comment');
            console.log(`[addComment] Checked achievements for user ${currentUserId} after adding comment.`);
        } else {
            console.warn(`[addComment] Commenting user not found for ID: ${currentUserId}. Gamification skipped.`);
        }


        if (post.userId.toString() !== currentUserId) { 
            await createNotification(
                post.userId, 
                currentUserId, 
                'comment', 
                `${userCommented} commented on your post: "${post.postTitle.substring(0, 50)}..."`, 
                `/posts/${postId}` 
            );
            console.log(`[addComment] Created comment notification for post owner ${post.userId}.`);
        }



        const mentionedUsernames = extractMentions(commentBody);
        console.log(`[addComment] Extracted mentions from comment:`, mentionedUsernames);

        if (mentionedUsernames.length > 0) {
            const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } }, '_id username');
            console.log(`[addComment] Found mentioned users from comment:`, mentionedUsers.map(u => u.username));

            for (const mentionedUser of mentionedUsers) {

                if (mentionedUser._id.toString() !== currentUserId && mentionedUser._id.toString() !== post.userId.toString()) {
                    await createNotification(
                        mentionedUser._id, 
                        currentUserId, 
                        'mention', 
                        `You were mentioned by ${userCommented} in a comment on "${post.postTitle.substring(0, 50)}..."`, 
                        `/posts/${postId}` 
                    );
                    console.log(`[addComment] Created mention notification for ${mentionedUser.username} from comment.`);
                } else {
                    console.log(`[addComment] Skipping self-mention or post owner mention notification for user ${mentionedUser.username}.`);
                }
            }
        }


        res.status(200).json(post);
        console.log(`--- [addComment] END ---`);
    } catch (error) {
        console.error(`[addComment] ERROR adding comment to post ${postId}:`, error);
        res.status(400).json({ message: "Couldn't add comment." });
        console.log(`--- [addComment] END ---`);
    }
};

export const deleteComment = async (req, res) => {
    console.log(`\n--- [deleteComment] START ---`);
    const { id: postId, commentId } = req.params;
    const userId = req.userId; 

    console.log(`[deleteComment] Request to delete comment ${commentId} from Post ${postId} by User ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
        console.error(`[deleteComment] ERROR: Invalid Post or Comment ID.`);
        return res.status(404).send('Post or Comment unavailable...');
    }

    try {
        const post = await Posts.findById(postId);
        if (!post) {
            console.error(`[deleteComment] Post not found for ID: ${postId}.`);
            return res.status(404).json({ message: "Post not found." });
        }


        const commentToDelete = post.comment.id(commentId);
        if (!commentToDelete) {
            console.warn(`[deleteComment] Comment ${commentId} not found in post ${postId}.`);
            return res.status(404).json({ message: "Comment not found." });
        }


        if (commentToDelete.userId.toString() !== userId && post.userId.toString() !== userId) {
            console.warn(`[deleteComment] Unauthorized: User ${userId} tried to delete comment ${commentId} (owned by ${commentToDelete.userId}) from post ${postId} (owned by ${post.userId}).`);
            return res.status(403).json({ message: "You are not authorized to delete this comment." });
        }

        post.comment.pull(commentId); 
        post.noOfComments = Math.max(0, (post.noOfComments || 0) - 1); 
        await post.save();

        console.log(`[deleteComment] Comment ${commentId} successfully deleted from post ${postId}.`);
        res.status(200).json({ message: "Comment deleted successfully." });
        console.log(`--- [deleteComment] END ---`);

    } catch (error) {
        console.error(`[deleteComment] ERROR deleting comment ${commentId} from post ${postId}:`, error);
        res.status(500).json({ message: "Something went wrong while deleting the comment." });
        console.log(`--- [deleteComment] END ---`);
    }
};

export const searchPostsByTitle = async (req, res) => {
    console.log(`\n--- [searchPostsByTitle] START ---`);
    const { q } = req.query; 
    console.log(`[searchPostsByTitle] Search query received: "${q}"`);

    if (!q || q.trim().length === 0) {
        console.warn(`[searchPostsByTitle] Warning: Search query is empty.`);
        return res.status(200).json([]);
    }

    try {
        const posts = await Posts.find({
            postTitle: { $regex: q.trim(), $options: 'i' }
        }).sort({ postedOn: -1 });

        console.log(`[searchPostsByTitle] Found ${posts.length} posts matching "${q}".`);
        res.status(200).json(posts);
        console.log(`--- [searchPostsByTitle] END ---`);
    } catch (error) {
        console.error(`[searchPostsByTitle] ERROR searching posts by title "${q}":`, error);
        res.status(500).json({ message: "Error searching posts." });
        console.log(`--- [searchPostsByTitle] END ---`);
    }
};

export const getPostSuggestions = async (req, res) => {
    console.log(`\n--- [getPostSuggestions] START ---`);
    const { q } = req.query; 
    console.log(`[getPostSuggestions] Suggestion query received: "${q}"`);

    if (!q || q.trim().length < 2) {
        console.warn(`[getPostSuggestions] Warning: Suggestion query too short or empty.`);
        return res.status(200).json([]);
    }

    try {
        const suggestions = await Posts.find(
            { postTitle: { $regex: q.trim(), $options: 'i' } },
            { postTitle: 1, _id: 1 }
        ).limit(10);

        console.log(`[getPostSuggestions] Found ${suggestions.length} suggestions for "${q}".`);
        res.status(200).json(suggestions);
        console.log(`--- [getPostSuggestions] END ---`);
    } catch (error) {
        console.error(`[getPostSuggestions] ERROR fetching post suggestions for "${q}":`, error);
        res.status(500).json({ message: "Error fetching suggestions." });
        console.log(`--- [getPostSuggestions] END ---`);
    }
};