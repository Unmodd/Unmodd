import mongoose from 'mongoose';
import User from '../models/auth.js';
import Post from '../models/Posts.js';
import multer from 'multer';


import { cloudinary, storage } from '../config/cloudinary.js'; 


import { addXP, checkAndAwardAchievements, updateUserCounts, completeTaskByCriteria } from './gamification.js';



const upload = multer({
    storage: storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; 
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports images (jpeg, jpg, png, gif)!"));
    },
}).single('profilePicture'); 



export const searchUsersByUsername = async (req, res) => {

    console.log("[Backend] searchUsersByUsername controller hit!"); 
    const searchQuery = req.query.q; 

    if (!searchQuery || searchQuery.trim().length < 1) {
        console.log("[Backend] Empty search query.");
        return res.status(200).json([]); 
    }

    try {
        const regex = new RegExp(searchQuery.trim(), 'i'); 

        const users = await User.find({
            $or: [
                { username: { $regex: regex } },
                { name: { $regex: regex } } 
            ]
        }).select('username name profilePicture _id'); 

        console.log(`[Backend] Found ${users.length} users for query: '${searchQuery}'`);
        res.status(200).json(users);
    } catch (error) {
        console.error(`[Backend] ERROR searching users by username:`, error);
        res.status(500).json({ message: "Failed to search users." });
    }
};




export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find().select(
            'name username email about tags joinedOn profilePicture socialLinks ' +
            'xp level rank achievements tasks postsCount commentsCount likesGivenCount ' +
            'loginStreak lastLogin referralCode referredBy referredUsersCount'
        );
        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserProfileById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send("User unavailable...");
    }
    try {
        const user = await User.findById(id).select(
            'name username email about tags joinedOn profilePicture socialLinks ' +
            'xp level rank achievements tasks postsCount commentsCount likesGivenCount ' +
            'loginStreak lastLogin referralCode referredBy referredUsersCount'
        );
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = (req, res) => {

    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer error during profile update:", err);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: "File too large. Max 5MB allowed." });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            console.error("Unknown error during profile update:", err);
            return res.status(500).json({ message: err.message });
        }

        const { id: _id } = req.params;

        let { name, username, about, tags, socialLinks } = req.body;


        console.log("[Backend] Received req.body:", req.body);
        console.log("[Backend] Received req.file (from Cloudinary upload):", req.file);


        let parsedSocialLinks = {};
        try {

            if (socialLinks && typeof socialLinks === 'string') {
                parsedSocialLinks = JSON.parse(socialLinks);
                console.log("[Backend] Parsed socialLinks:", parsedSocialLinks);
            } else if (socialLinks && typeof socialLinks === 'object') {
                parsedSocialLinks = socialLinks; 
                console.log("[Backend] socialLinks already an object:", parsedSocialLinks);
            }

            if (tags && typeof tags === 'string') {
                tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                console.log("[Backend] Parsed tags:", tags);
            } else if (tags && Array.isArray(tags)) {
                tags = tags; 
                console.log("[Backend] tags already an array:", tags);
            } else {
                tags = []; 
            }
        } catch (parseError) {
            console.error("Error parsing socialLinks or tags:", parseError);
            return res.status(400).json({ message: "Invalid social links or tags format." });
        }


        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(404).send("User unavailable...");
        }
        if (req.userId !== _id.toString()) {
            return res.status(403).json({ message: "Unauthorized: You can only edit your own profile." });
        }

        try {

            const user = await User.findById(_id);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            const updateFields = { name, username, about, tags, socialLinks: parsedSocialLinks };


            if (req.file) {

                updateFields.profilePicture = req.file.path;



                console.log(`[Backend] New profile picture Cloudinary URL: ${updateFields.profilePicture}`);




                
            }

            else if (req.body.profilePicture === '') {

                
                updateFields.profilePicture = ''; 
                console.log("[Backend] Profile picture explicitly cleared in DB (Cloudinary URL removed).");
            }





            const updatedProfile = await User.findByIdAndUpdate(
                _id,
                { $set: updateFields }, 
                { new: true, runValidators: true } 
            ).select( 
                'name username email about tags joinedOn profilePicture socialLinks ' +
                'xp level rank achievements tasks postsCount commentsCount likesGivenCount ' +
                'loginStreak lastLogin referralCode referredBy referredUsersCount'
            );

            if (!updatedProfile) {
                return res.status(404).json({ message: "User not found after update attempt." });
            }


            let taskCompletedNow = false; 
            let xpRewardForTask = 0; 

            const completeProfileTask = updatedProfile.tasks.find(
                task => task.criteria === 'complete_profile_setup' 
            );


            if (completeProfileTask && !completeProfileTask.completed) {

                const hasBio = updatedProfile.about && updatedProfile.about.trim() !== '';

                const hasTwitterUrl = updatedProfile.socialLinks?.x && updatedProfile.socialLinks.x.trim() !== ''; 
                const hasProfilePicture = updatedProfile.profilePicture && updatedProfile.profilePicture.trim() !== '';

                console.log(`[Profile Task Check] User ID: ${_id}`);
                console.log(`[Profile Task Check] Has Bio: ${hasBio} (Value: '${updatedProfile.about}')`);
                console.log(`[Profile Task Check] Has Twitter: ${hasTwitterUrl} (Value: '${updatedProfile.socialLinks?.x}')`);
                console.log(`[Profile Task Check] Has Picture: ${hasProfilePicture} (Value: '${updatedProfile.profilePicture}')`);


                if (hasBio && hasTwitterUrl && hasProfilePicture) {


                    xpRewardForTask = completeProfileTask.xpReward; 
                    await completeTaskByCriteria(_id, 'complete_profile_setup'); 
                    taskCompletedNow = true;
                    console.log(`[Automated Task] User ${updatedProfile.username} (ID: ${_id}) completed 'Complete Profile Setup' task. Awarded ${xpRewardForTask} XP.`);
                }
            }




            const finalUser = await User.findById(_id).select(
                'name username email about tags joinedOn profilePicture socialLinks ' +
                'xp level rank achievements tasks postsCount commentsCount likesGivenCount ' +
                'loginStreak lastLogin referralCode referredBy referredUsersCount'
            );


            console.log("[Backend] Profile successfully updated in DB and tasks checked. Final User State:", finalUser);
            res.status(200).json({
                user: finalUser.toObject({ getters: true }),
                taskCompletion: taskCompletedNow ? {
                    message: "Profile completion task marked!",
                    xpGained: xpRewardForTask
                } : null
            });
        } catch (error) {
            console.error("Error updating profile in DB:", error);

            if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
                return res.status(400).json({ message: "Username already taken." });
            }
            res.status(500).json({ message: error.message });
        }
    });
};

export const updatePostsCount = async (userId) => {
    try {
        const count = await Post.countDocuments({ userId: userId });
        await User.findByIdAndUpdate(userId, { postsCount: count });
        console.log(`Updated posts count for user ${userId} to ${count}`);
    } catch (error) {
        console.error(`Error updating posts count for user ${userId}:`, error.message);
    }
};

export const toggleTaskCompletion = async (req, res) => {
    const { userId, taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(404).send('Invalid user or task ID.');
    }
    if (req.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You can only modify your own tasks." });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        const task = user.tasks.id(taskId);
        if (!task) return res.status(404).json({ message: "Task not found." });


        if (task.isAutomated || (task.type === 'daily' && task.completed)) { 
            console.warn(`Attempt to manually toggle an automated or already completed daily task: Task ID ${taskId}, User ID ${userId}`);
            return res.status(403).json({ message: "This task cannot be manually toggled." });
        }

        task.completed = !task.completed;
        task.completedDate = task.completed ? new Date() : null; 

        await user.save();

        if (task.completed) {

            await addXP(userId, task.xpReward); 
            await checkAndAwardAchievements(userId, 'manual_task_completed', { criteria: task.criteria, type: task.type });
            console.log(`[Manual Task] User ${user.username} manually completed "${task.description}". XP gained: ${task.xpReward}`);
        } else {

            console.log(`[Manual Task] User ${user.username} uncompleted "${task.description}".`);
        }

        res.status(200).json({
            message: `${task.description} ${task.completed ? 'completed' : 'uncompleted'}!`,
            user: user.toObject({ getters: true }),
            xpChange: task.completed ? task.xpReward : 0 
        });

    } catch (error) {
        console.error("Error toggling task completion:", error);
        res.status(500).json({ message: error.message });
    }
};



export const completeManualTask = async (req, res) => {
    const { userId } = req.params;
    const { taskId } = req.body;

    console.log(`[completeManualTask] Received request: userId=${userId}, taskId=${taskId}`);

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(taskId)) {
        console.error(`[completeManualTask] Invalid ObjectId format: userId=${userId}, taskId=${taskId}`);
        return res.status(400).json({ message: 'Invalid user or task ID format.' });
    }


    if (req.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You can only complete your own tasks." });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[completeManualTask] User not found for ID: ${userId}`);
            return res.status(404).json({ message: 'User not found.' });
        }

        const taskToComplete = user.tasks.id(taskId); 

        if (!taskToComplete) {
            console.warn(`[completeManualTask] Task with ID ${taskId} not found for user ${userId}.`);
            return res.status(404).json({ message: 'Task not found.' });
        }

        if (taskToComplete.completed) {
            console.log(`[completeManualTask] Task "${taskToComplete.description}" is already completed.`);
            return res.status(400).json({ message: 'Task is already completed.' });
        }


        if (taskToComplete.isAutomated) {
            console.warn(`[completeManualTask] Attempt to manually complete an automated task: ${taskToComplete.criteria}`);
            return res.status(403).json({ message: `This task ('${taskToComplete.description}') is automated and cannot be manually completed.` });
        }



        const allowedManualCriteria = [
            'like_retweet_unmodd_tweet',
            'follow_unmodd_twitter',
            'join_telegram_group',

        ];

        if (!allowedManualCriteria.includes(taskToComplete.criteria)) {
            console.warn(`[completeManualTask] Attempt to manually complete restricted task: User ${userId}, Task ID: ${taskId}, Criteria: ${taskToComplete.criteria}`);
            return res.status(403).json({ message: `This task ('${taskToComplete.description}') cannot be manually completed through this endpoint. Criteria '${taskToComplete.criteria}' is not allowed.` });
        }

        taskToComplete.completed = true;
        taskToComplete.completedDate = new Date();


        await addXP(userId, taskToComplete.xpReward); 


        await checkAndAwardAchievements(userId, 'manual_task_completed', {
            criteria: taskToComplete.criteria,
            type: taskToComplete.type
        });

        console.log(`[Manual Task] User ${user.username} manually completed "${taskToComplete.description}". XP gained: ${taskToComplete.xpReward}`);
        res.status(200).json({
            message: `${taskToComplete.description} completed!`,
            user: user.toObject({ getters: true }), 
            xpGained: taskToComplete.xpReward
        });

    } catch (error) {
        console.error('Error completing manual task:', error);
        res.status(500).json({ message: 'Server error completing task.', details: error.message });
    }
};