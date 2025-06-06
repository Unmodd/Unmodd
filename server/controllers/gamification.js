
import mongoose from 'mongoose';
import User from '../models/auth.js';
import DailyTaskTemplate from '../models/dailyTaskTemplate.js';


import { allAchievements } from '../config/dailyTasks.js'; 


export const addXP = async (userId, amount) => {
    console.log(`\n--- [addXP] START ---`);
    console.log(`[addXP] Attempting to add ${amount} XP to user: ${userId}`);
    try {
        const user = await User.findById(userId);
        if (user) {
            const oldXp = user.xp || 0;
            user.xp = oldXp + amount;

            await user.save(); 
            console.log(`[addXP] User ${user.email} XP updated from ${oldXp} to ${user.xp}. Current Level: ${user.level}, Rank: ${user.rank}`);
            console.log(`--- [addXP] END ---`);
            return user;
        } else {
            console.warn(`[addXP] User not found for XP update: ${userId}`);
            console.log(`--- [addXP] END ---`);
            return null;
        }
    } catch (error) {
        console.error(`[addXP] ERROR adding XP to user ${userId}:`, error);
        console.log(`--- [addXP] END ---`);
        return null;
    }
};


export const completeTaskByCriteria = async (userId, criteria) => {
    console.log(`\n--- [completeTaskByCriteria] START ---`);
    console.log(`[completeTaskByCriteria] Request to complete task for User ID: ${userId}, Criteria: '${criteria}'`);
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[completeTaskByCriteria] User not found for ID: ${userId}. Cannot complete task.`);
            console.log(`--- [completeTaskByCriteria] END ---`);
            return null;
        }
        console.log(`[completeTaskByCriteria] User found: ${user.email}`);

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); 

        const startOfWeek = new Date(today);
        const day = startOfWeek.getUTCDay(); 
        const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1); 
        startOfWeek.setUTCDate(diff);
        startOfWeek.setUTCHours(0, 0, 0, 0);

        let taskToComplete = null;
        let templateForCriteria = await DailyTaskTemplate.findOne({ criteria: criteria });

        if (!templateForCriteria) {
            console.warn(`[completeTaskByCriteria] Task template not found for criteria: ${criteria}. Cannot proceed.`);
            console.log(`--- [completeTaskByCriteria] END ---`);
            return null;
        }

        for (let i = 0; i < user.tasks.length; i++) {
            const task = user.tasks[i];


            if (task.criteria !== criteria || task.completed) {
                continue; 
            }

            const assignedDate = task.assignedDate ? new Date(task.assignedDate) : null;
            if (assignedDate) assignedDate.setUTCHours(0, 0, 0, 0);

            let isCurrentTimeframe = false;
            if (task.type === 'daily') {
                isCurrentTimeframe = assignedDate && assignedDate.getTime() === today.getTime();
            } else if (task.type === 'weekly') {
                isCurrentTimeframe = assignedDate && assignedDate.getTime() >= startOfWeek.getTime();
            } else if (task.type === 'onetime') {
                isCurrentTimeframe = true; 
            }

            if (!isCurrentTimeframe) {
                console.log(`   [completeTaskByCriteria] Task "${task.description}" (ID: ${task._id}) not in current timeframe.`);
                continue;
            }


            if (criteria === 'upvote_5_posts' && user.dailyUpvotesCount >= templateForCriteria.maxCompletions) {
                taskToComplete = task;
                console.log(`   [completeTaskByCriteria] 'upvote_5_posts' criteria met. Count: ${user.dailyUpvotesCount}`);
                break;
            } else if (criteria === 'comment_3_posts' && user.dailyCommentsCount >= templateForCriteria.maxCompletions) {
                taskToComplete = task;
                console.log(`   [completeTaskByCriteria] 'comment_3_posts' criteria met. Count: ${user.dailyCommentsCount}`);
                break;
            } else if (criteria === 'say_gm_in_chat' && user.hasSaidGmToday) {
                   taskToComplete = task;
                   console.log(`   [completeTaskByCriteria] 'say_gm_in_chat' criteria met.`);
                   break;
            } else if (criteria === 'create_post_any_type' && user.weeklyPostsCount >= 1 && user.weeklyPostsCount <= templateForCriteria.maxCompletions) {



                const alreadyCompletedCount = user.tasks.filter(t =>
                    t.criteria === criteria &&
                    t.type === 'weekly' &&
                    t.completed &&
                    new Date(t.assignedDate).setUTCHours(0,0,0,0) >= startOfWeek.getTime()
                ).length;

                if (alreadyCompletedCount < templateForCriteria.maxCompletions) {

                    const newCompletionEntry = {
                        description: task.description,
                        xpReward: task.xpReward,
                        completed: true,
                        type: 'weekly',
                        assignedDate: new Date(), 
                        completedDate: new Date(),
                        criteria: task.criteria,
                        externalLink: task.externalLink,
                    };
                    user.tasks.push(newCompletionEntry);
                    taskToComplete = newCompletionEntry; 
                    await addXP(userId, newCompletionEntry.xpReward); 
                    console.log(`   [completeTaskByCriteria] 'create_post_any_type' criteria met (count: ${user.weeklyPostsCount}). Awarded XP for this post.`);
                    break; 
                } else {
                    console.log(`   [completeTaskByCriteria] 'create_post_any_type' max completions reached for user ${userId} this week.`);
                    return null; 
                }
            } else if (criteria === 'post_moonshot_10x' && user.weeklyMoonshotsCount >= 1 && user.weeklyMoonshotsCount <= templateForCriteria.maxCompletions) {

                const alreadyCompletedCount = user.tasks.filter(t =>
                    t.criteria === criteria &&
                    t.type === 'weekly' &&
                    t.completed &&
                    new Date(t.assignedDate).setUTCHours(0,0,0,0) >= startOfWeek.getTime()
                ).length;

                if (alreadyCompletedCount < templateForCriteria.maxCompletions) {
                    const newCompletionEntry = {
                        description: task.description,
                        xpReward: task.xpReward,
                        completed: true,
                        type: 'weekly',
                        assignedDate: new Date(),
                        completedDate: new Date(),
                        criteria: task.criteria,
                        externalLink: task.externalLink,
                    };
                    user.tasks.push(newCompletionEntry);
                    taskToComplete = newCompletionEntry;
                    await addXP(userId, newCompletionEntry.xpReward);
                    console.log(`   [completeTaskByCriteria] 'post_moonshot_10x' criteria met (count: ${user.weeklyMoonshotsCount}). Awarded XP for this moonshot.`);
                    break;
                } else {
                    console.log(`   [completeTaskByCriteria] 'post_moonshot_10x' max completions reached for user ${userId} this week.`);
                    return null;
                }
            }

            else if (task.type === 'daily' && criteria === 'login_today' && assignedDate.getTime() === today.getTime() && !task.completed) {
                taskToComplete = task;
                break;
            } else if (task.type === 'daily' && criteria === 'like_retweet_unmodd_tweet' && assignedDate.getTime() === today.getTime() && !task.completed) {
                taskToComplete = task;
                break;
            } else if (task.type === 'onetime' && !task.completed) {

                if (criteria === 'complete_profile_setup' || criteria === 'follow_x_join_tg') {
                    taskToComplete = task;
                    break;
                }
            }
        } 

        if (!taskToComplete) {
            console.log(`[completeTaskByCriteria] No uncompleted or relevant task found for criteria "${criteria}" for user ${userId}.`);
            console.log(`--- [completeTaskByCriteria] END ---`);
            return null;
        }


        if (!['create_post_any_type', 'post_moonshot_10x'].includes(criteria)) {
            taskToComplete.completed = true;
            taskToComplete.completedDate = new Date();
            console.log(`[completeTaskByCriteria] Task "${taskToComplete.description}" status set to completed.`);
            await addXP(userId, taskToComplete.xpReward); 
        }

        await user.save(); 

        console.log(`[completeTaskByCriteria] Task Completed: "${templateForCriteria.description}" (Criteria: ${criteria}). Awarded ${templateForCriteria.xpReward} XP.`);


        await checkAndAwardAchievements(userId, 'task_complete', { criteria: criteria, type: templateForCriteria.type });
        console.log(`[completeTaskByCriteria] Checked achievements for user ${userId}.`);

        console.log(`--- [completeTaskByCriteria] END ---`);
        return user;
    } catch (error) {
        console.error(`[completeTaskByCriteria] FATAL ERROR completing task by criteria ${criteria} for user ${userId}:`, error);
        console.log(`--- [completeTaskByCriteria] END ---`);
        return null;
    }
};



export const assignDailyAndWeeklyTasksForUser = async (userId) => {
    console.log(`\n--- [assignDailyAndWeeklyTasksForUser] START ---`);
    console.log(`[assignDailyAndWeeklyTasksForUser] Assigning tasks for user: ${userId}`);
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[assignDailyAndWeeklyTasksForUser] User not found for ID: ${userId}.`);
            console.log(`--- [assignDailyAndWeeklyTasksForUser] END ---`);
            return;
        }

        const now = new Date(); 
        const todayUTC = new Date(now);
        todayUTC.setUTCHours(0, 0, 0, 0);

        let userTasksModified = false;


        const lastDailyAssigned = user.lastDailyTaskAssigned ? new Date(user.lastDailyTaskAssigned) : null;
        if (lastDailyAssigned) lastDailyAssigned.setUTCHours(0, 0, 0, 0);

        if (!lastDailyAssigned || lastDailyAssigned.getTime() < todayUTC.getTime()) {
            console.log(`[assignDailyAndWeeklyTasksForUser] Resetting and assigning new daily tasks for ${user.email}.`);




            user.tasks = user.tasks.filter(task => task.type !== 'daily');


            user.dailyUpvotesCount = 0;
            user.dailyCommentsCount = 0;
            user.hasSaidGmToday = false; 
            userTasksModified = true;

            const dailyTemplates = await DailyTaskTemplate.find({ type: 'daily', active: true });
            const newDailyTasks = dailyTemplates.map(template => ({
                description: template.description,
                xpReward: template.xpReward,
                completed: false,
                type: 'daily',
                assignedDate: now, 
                criteria: template.criteria,
                externalLink: template.externalLink
            }));
            user.tasks.push(...newDailyTasks);
            user.lastDailyTaskAssigned = now; 
            userTasksModified = true;
            console.log(`[assignDailyAndWeeklyTasksForUser] Added ${newDailyTasks.length} new daily tasks.`);
        } else {
            console.log(`[assignDailyAndWeeklyTasksForUser] User ${user.email} already has daily tasks for today.`);
        }


        const startOfWeekUTC = new Date(todayUTC);
        const day = startOfWeekUTC.getUTCDay(); 
        const diff = startOfWeekUTC.getUTCDate() - day + (day === 0 ? -6 : 1); 
        startOfWeekUTC.setUTCDate(diff);
        startOfWeekUTC.setUTCHours(0, 0, 0, 0);
        console.log(`[assignDailyAndWeeklyTasksForUser] Start of current UTC week: ${startOfWeekUTC.toISOString()}`);

        const lastWeeklyReset = user.lastWeeklyTaskReset ? new Date(user.lastWeeklyTaskReset) : null;
        if (lastWeeklyReset) lastWeeklyReset.setUTCHours(0, 0, 0, 0);

        if (!lastWeeklyReset || lastWeeklyReset.getTime() < startOfWeekUTC.getTime()) {
            console.log(`[assignDailyAndWeeklyTasksForUser] Resetting and assigning new weekly tasks for ${user.email}.`);




            user.tasks = user.tasks.filter(task => {
                if (task.type !== 'weekly') return true; 
                const taskAssignedDateUTC = new Date(task.assignedDate);
                taskAssignedDateUTC.setUTCHours(0, 0, 0, 0);



                return taskAssignedDateUTC.getTime() >= startOfWeekUTC.getTime() || task.completed;
            });

            user.weeklyMoonshotsCount = 0; 
            user.weeklyPostsCount = 0;
            userTasksModified = true;

            const weeklyTemplates = await DailyTaskTemplate.find({ type: 'weekly', active: true });
            const newWeeklyTasks = weeklyTemplates.map(template => ({
                description: template.description,
                xpReward: template.xpReward,
                completed: false,
                type: 'weekly',
                assignedDate: now,
                criteria: template.criteria,
                externalLink: template.externalLink
            }));
            user.tasks.push(...newWeeklyTasks);
            user.lastWeeklyTaskReset = now;
            userTasksModified = true;
            console.log(`[assignDailyAndWeeklyTasksForUser] Added ${newWeeklyTasks.length} new weekly tasks.`);
        } else {
            console.log(`[assignDailyAndWeeklyTasksForUser] User ${user.email} already has weekly tasks for this week.`);
        }



        const oneTimeTemplates = await DailyTaskTemplate.find({ type: 'onetime', active: true });
        for (const template of oneTimeTemplates) {
            const hasTask = user.tasks.some(task => task.criteria === template.criteria && task.type === 'onetime');
            if (!hasTask) {
                user.tasks.push({
                    description: template.description,
                    xpReward: template.xpReward,
                    completed: false,
                    type: 'onetime',
                    assignedDate: now,
                    criteria: template.criteria,
                    externalLink: template.externalLink
                });
                userTasksModified = true;
                console.log(`[assignDailyAndWeeklyTasksForUser] Added missing one-time task: "${template.description}" to user ${user.email}.`);
            }
        }


        if (userTasksModified) {
            await user.save();
            console.log(`[assignDailyAndWeeklyTasksForUser] User ${user.email} document saved after task assignment.`);
        } else {
            console.log(`[assignDailyAndWeeklyTasksForUser] No new tasks assigned for user ${user.email}.`);
        }

        console.log(`--- [assignDailyAndWeeklyTasksForUser] END ---`);
        return user;
    } catch (error) {
        console.error(`[assignDailyAndWeeklyTasksForUser] ERROR assigning daily/weekly tasks for user ${userId}:`, error);
        console.log(`--- [assignDailyAndWeeklyTasksForUser] END ---`);
        return null;
    }
};



export const assignDailyTasksToAllUsers = async () => {
    console.log(`\n--- [CRON JOB] assignDailyTasksToAllUsers START (${new Date().toISOString()}) ---`);
    try {
        const users = await User.find({});
        for (const user of users) {
            await assignDailyAndWeeklyTasksForUser(user._id); 
        }
        console.log(`[CRON JOB] All users processed for daily/weekly task assignment.`);
    } catch (error) {
        console.error(`[CRON JOB] ERROR during bulk daily task assignment:`, error);
    }
    console.log(`--- [CRON JOB] assignDailyTasksToAllUsers END ---`);
};


export const updateLoginStreak = async (userId) => {
    console.log(`\n--- [updateLoginStreak] START ---`);
    console.log(`[updateLoginStreak] Updating streak for user: ${userId}`);
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[updateLoginStreak] User not found for streak update: ${userId}`);
            console.log(`--- [updateLoginStreak] END ---`);
            return null;
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); 

        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        if (lastLogin) lastLogin.setUTCHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setUTCDate(today.getUTCDate() - 1); 

        let streakChanged = false;

        if (lastLogin && lastLogin.getTime() === today.getTime()) {

            console.log(`[Streak] User ${user.email} already logged in today. Streak remains ${user.loginStreak}`);
        } else if (lastLogin && lastLogin.getTime() === yesterday.getTime()) {

            user.loginStreak += 1;
            streakChanged = true;
            console.log(`[Streak] User ${user.email} login streak increased to ${user.loginStreak}`);
            await checkAndAwardAchievements(user._id, 'login_streak_update'); 
        } else {

            user.loginStreak = 1;
            streakChanged = true;
            console.log(`[Streak] User ${user.email} started a new login streak (1).`);
        }

        user.lastLogin = new Date(); 
        await user.save(); 
        console.log(`[Streak] User ${user.email} login streak updated.`);
        console.log(`--- [updateLoginStreak] END ---`);
        return user;

    } catch (error) {
        console.error(`[updateLoginStreak] Error updating login streak for user ${userId}:`, error);
        console.log(`--- [updateLoginStreak] END ---`);
        return null;
    }
};


export const checkAndAwardAchievements = async (userId, eventType, eventData = {}) => {
    console.log(`\n--- [checkAndAwardAchievements] START ---`);
    console.log(`[checkAndAwardAchievements] Checking for user: ${userId}, triggered by event: '${eventType}'`);
    console.log(`[checkAndAwardAchievements] Event data:`, eventData);
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[checkAndAwardAchievements] User not found for ID: ${userId}.`);
            console.log(`--- [checkAndAwardAchievements] END ---`);
            return;
        }
        console.log(`[checkAndAwardAchievements] User found: ${user.email}. Current achievements: ${user.achievements.map(a => a.name).join(', ') || 'None'}`);

        let achievementsUpdated = false;

        const isAchievementAwarded = (name) => user.achievements.some(ach => ach.name === name);



        const localAchievements = allAchievements || [
             { name: 'First Daily Task', criteria: 'first_daily_task', rewardXp: 50, badge: 'url_to_badge' },
             { name: '7-Day Streak', criteria: 'login_streak_7', rewardXp: 100, badge: 'url_to_badge' },
             { name: '30-Day Streak', criteria: 'login_streak_30', rewardXp: 250, badge: 'url_to_badge' },
             { name: 'Post Creator', criteria: 'posts_10', rewardXp: 75, badge: 'url_to_badge' },
             { name: 'First Referral', criteria: 'user_referred', rewardXp: 50, badge: 'url_to_badge' },
             { name: 'Profile Perfect', criteria: 'complete_profile_setup_achievement', rewardXp: 150, badge: 'url_to_badge' },
             { name: 'Social Butterfly', criteria: 'follow_x_join_tg_achievement', rewardXp: 200, badge: 'url_to_badge' },
             { name: 'Post Popular', criteria: 'post_liked_by_others', rewardXp: 100, badge: 'url_to_badge' }, 

        ];


        for (const achievement of localAchievements) { 
            console.log(`   [checkAndAwardAchievements] Evaluating achievement: "${achievement.name}" (Criteria: ${achievement.criteria})`);
            if (isAchievementAwarded(achievement.name)) {
                console.log(`     Already awarded to user ${user.email}. Skipping.`);
                continue;
            }

            let awarded = false;
            switch (achievement.criteria) {
                case 'first_daily_task':

                    if (eventType === 'task_complete' && eventData.type === 'daily') {

                        const totalDailyTasksCompleted = user.tasks.filter(t => t.type === 'daily' && t.completed).length;
                        if (totalDailyTasksCompleted === 1) { 
                            awarded = true;
                        }
                    }
                    break;
                case 'login_streak_7':
                case 'login_streak_30':
                    const streakTarget = parseInt(achievement.criteria.split('_')[2]);
                    if (eventType === 'login_streak_update' && user.loginStreak && user.loginStreak >= streakTarget) {
                        awarded = true;
                    }
                    break;
                case 'posts_10':
                    if (eventType === 'create_post' && user.postsCount >= 10) {
                        awarded = true;
                    }
                    break;
                case 'user_referred':
                    if (eventType === 'user_referred' && user.referredUsersCount >= 1) {
                        awarded = true;
                    }
                    break;
                case 'complete_profile_setup_achievement':
                    if (eventType === 'task_complete' && eventData.criteria === 'complete_profile_setup') {
                        awarded = true;
                    }
                    break;
                case 'follow_x_join_tg_achievement':
                    if (eventType === 'task_complete' && eventData.criteria === 'follow_x_join_tg') {
                        awarded = true;
                    }
                    break;
                case 'post_liked_by_others': 

                    if (eventType === 'post_liked_by_others') {





                        awarded = true; 
                    }
                    break;
                default:
                    console.log(`     Unknown achievement criteria: ${achievement.criteria}`);
                    break;
            }

            if (awarded) {
                user.achievements.push({
                    name: achievement.name,
                    awardedDate: new Date(),
                    badge: achievement.badge
                });
                user.xp += achievement.rewardXp; 
                achievementsUpdated = true;
                console.log(`   [checkAndAwardAchievements] ACHIEVEMENT AWARDED: "${achievement.name}"! Reward: ${achievement.rewardXp} XP.`);
            }
        }

        if (achievementsUpdated) {
            await user.save(); 
            console.log(`[checkAndAwardAchievements] User document saved after awarding achievements.`);
        } else {
            console.log(`[checkAndAwardAchievements] No new achievements awarded for user ${userId}.`);
        }
        console.log(`--- [checkAndAwardAchievements] END ---`);
    } catch (error) {
        console.error(`[checkAndAwardAchievements] FATAL ERROR checking/awarding achievements for user ${userId}:`, error);
        console.log(`--- [checkAndAwardAchievements] END ---`);
    }
};



export const updateUserCounts = async (userId, field, increment = 1) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;
        user[field] = (user[field] || 0) + increment;
        await user.save();
    } catch (error) {
        console.error(`Error updating user count for ${field} for user ${userId}:`, error);
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

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[completeManualTask] User not found for ID: ${userId}`);
            return res.status(404).json({ message: 'User not found.' });
        }



        const taskToComplete = user.tasks.id(taskId); 




        if (!taskToComplete) {
            console.warn(`[completeManualTask] Task with ID ${taskId} not found or already completed for user ${userId}.`);
            return res.status(400).json({ message: 'Task not found or already completed.' });
        }

        if (taskToComplete.completed) {
            console.log(`[completeManualTask] Task "${taskToComplete.description}" is already completed.`);
            return res.status(400).json({ message: 'Task is already completed.' });
        }




        const allowedManualCriteria = [
            'like_retweet_unmodd_tweet',
            'follow_unmodd_twitter',
            'join_telegram_group',
            'complete_profile_setup', 

        ];

        if (!allowedManualCriteria.includes(taskToComplete.criteria)) {
            console.warn(`[completeManualTask] Attempt to manually complete restricted task: User ${userId}, Task ID: ${taskId}, Criteria: ${taskToComplete.criteria}`);

            return res.status(403).json({ message: `This task ('${taskToComplete.description}') cannot be manually completed through this endpoint. Criteria '${taskToComplete.criteria}' is not allowed.` });
        }


        taskToComplete.completed = true;
        taskToComplete.completedDate = new Date();


        if (typeof addXP === 'function') {
            await addXP(userId, taskToComplete.xpReward);
            console.log(`[Manual Task] Awarded ${taskToComplete.xpReward} XP to user ${user.username} for "${taskToComplete.description}".`);
        } else {

            user.xp += taskToComplete.xpReward;
            console.log(`[Manual Task] Directly added ${taskToComplete.xpReward} XP to user ${user.username}.`);
        }



        if (typeof checkAndAwardAchievements === 'function') {
            await checkAndAwardAchievements(userId, 'manual_task_completed', { criteria: taskToComplete.criteria, type: taskToComplete.type });
            console.log(`[Manual Task] Achievements checked for user ${user.username}.`);
        } else {
            console.warn("[Manual Task] checkAndAwardAchievements function not available or not imported.");
        }


        await user.save();

        console.log(`[Manual Task] User ${user.username} manually completed "${taskToComplete.description}".`);
        res.status(200).json({
            message: `${taskToComplete.description} completed!`,
            user: user, 
            xpGained: taskToComplete.xpReward
        });

    } catch (error) {
        console.error('Error completing manual task:', error);
        res.status(500).json({ message: 'Server error completing task.', details: error.message });
    }
};