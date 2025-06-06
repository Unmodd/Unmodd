

import mongoose from 'mongoose';
import DailyTaskTemplate from './models/dailyTaskTemplate.js'; 
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' }); 

const seedAllTasks = async () => {
    try {
        await mongoose.connect(process.env.CONNECTION_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected for seeding...');



        await DailyTaskTemplate.deleteMany({});
        console.log('Cleared existing task templates.');

        const tasks = [

            {
                description: 'Login Today',
                xpReward: 10,
                type: 'daily',
                criteria: 'login_today',
                timeframe: 'daily',
                active: true
            },
            {
                description: 'Upvote any 5 Posts',
                xpReward: 20,
                type: 'daily',
                criteria: 'upvote_5_posts',
                timeframe: 'daily',
                active: true,
                maxCompletions: 5
            },
            {
                description: 'Leave 3 Comments on any posts',
                xpReward: 20,
                type: 'daily',
                criteria: 'comment_3_posts',
                timeframe: 'daily',
                active: true,
                maxCompletions: 3
            },
            {
                description: 'Say "GM" in Global Chat',
                xpReward: 10,
                type: 'daily',
                criteria: 'say_gm_in_chat',
                timeframe: 'daily',
                active: true
            },
            {
                description: 'Like & Retweet Unmodd\'s latest Tweet to earn XP!',
                xpReward: 100,
                type: 'daily',
                criteria: 'like_retweet_unmodd_tweet',
                timeframe: 'daily',
                active: true,
                externalLink: 'https://twitter.com/Unmoddcom/status/YOUR_LATEST_TWEET_ID' 
            },


            {
                description: 'Post a Moonshot (Max 5 Per Week)',
                xpReward: 100,
                type: 'weekly',
                criteria: 'post_moonshot_10x',
                timeframe: 'weekly',
                active: true,
                maxCompletions: 5
            },
            {
                description: 'Create a Post (Max 10 Per Week)',
                xpReward: 50,
                type: 'weekly',
                criteria: 'create_post_any_type',
                timeframe: 'weekly',
                active: true,
                maxCompletions: 10
            },



            {
                description: 'Complete your profile (Set bio, add social links, upload profile picture)',
                type: 'onetime',
                criteria: 'complete_profile_task',
                xpReward: 200,
                isAutomated: true,
                repeatable: false,
            },

            {
                description: 'Follow Unmodd on X (Twitter)',
                xpReward: 200, 
                type: 'onetime',
                criteria: 'follow_unmodd_twitter', 
                timeframe: 'onetime',
                active: true,
                externalLink: 'https://x.com/Unmoddcom'
            },
            {
                description: 'Join Unmodd\'s Telegram Group',
                xpReward: 200, 
                type: 'onetime',
                criteria: 'join_telegram_group', 
                timeframe: 'onetime',
                active: true,
                externalLink: 'https://t.me/Unmodd'
            },

        ];

        await DailyTaskTemplate.insertMany(tasks);
        console.log('All daily, weekly, and one-time task templates seeded successfully!');
    } catch (error) {
        console.error('Error seeding tasks:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected.');
    }
};


seedAllTasks();