

const allPossibleDailyTasks = [

    { description: "Login Today", xpReward: 5, criteria: 'login_today' },
    { description: "Post a Comment", xpReward: 10, criteria: 'post_comment' },
    { description: "Create a Post", xpReward: 15, criteria: 'create_post' },
    { description: "Like 3 Posts", xpReward: 5, criteria: 'like_3_posts' },
    { description: "Retweet or Share a Post", xpReward: 10, criteria: 'share_post' },
    { description: "Upvote a Gem Pick", xpReward: 5, criteria: 'upvote_gem_pick' },
    { description: "Upvote a Post", xpReward: 5, criteria: 'upvote_post' },


    { description: "Share a meme from our site", xpReward: 20, criteria: 'share_meme_social' },
    { description: "Write a short review/testimonial", xpReward: 15, criteria: 'write_review' },
    { description: "Refer a new user", xpReward: 50, criteria: 'refer_user' },
    { description: "Mention us on Twitter/X", xpReward: 20, criteria: 'mention_twitter' },


    { description: "Discover a New Meme Coin", xpReward: 30, criteria: 'discover_meme_coin' },
    { description: "Report a Trending Coin", xpReward: 20, criteria: 'report_trending_coin' },
    { description: "Pin Your Post", xpReward: -10, criteria: 'pin_post' },
    { description: "Drop Crypto Knowledge", xpReward: 15, criteria: 'drop_crypto_knowledge' },
];

export const getRandomDailyTasks = (numTasks = 3) => {

    const rotatableTasks = allPossibleDailyTasks.filter(task =>
        !['refer_user', 'mention_twitter', 'share_meme_social'].includes(task.criteria)
    );

    const shuffled = [...rotatableTasks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTasks);
};


export const getTaskByCriteria = (criteria) => {
    return allPossibleDailyTasks.find(task => task.criteria === criteria);
};

export const allAchievements = [
    { name: 'Fresh Start', description: 'Complete your first daily task', badge: 'badge_fresh_start.png', rewardXp: 5, criteria: 'first_daily_task' },
    { name: 'Streak Lord', description: 'Log in 7 days in a row', badge: 'badge_streak_lord.png', rewardXp: 50, criteria: 'login_streak_7' },
    { name: 'Crypto Guru', description: 'Make 10 insightful posts', badge: 'badge_crypto_guru.png', rewardXp: 100, criteria: 'posts_10' },
    { name: 'Diamond Hands', description: 'Log in 30 days in a month', badge: 'badge_diamond_hands.png', rewardXp: 300, criteria: 'login_streak_30' },

    { name: 'Influencer', description: 'Get 50+ likes on 1 post', badge: 'badge_influencer.png', rewardXp: 150, criteria: 'post_likes_50' },
    { name: 'Chatterbox', description: 'Leave 100+ comments', badge: 'badge_chatterbox.png', rewardXp: 100, criteria: 'comments_100' },
    { name: 'Recruiter', description: 'Refer 10 friends', badge: 'badge_recruiter.png', rewardXp: 200, criteria: 'referrals_10' },
];

export const getAchievementByName = (name) => {
    return allAchievements.find(ach => ach.name === name);
};