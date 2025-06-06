

import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    about: {type: String,},
    socialLinks: {
    x: { type: String },
    telegram: { type: String },
    discord: { type: String },
    },
    joinedOn: { type: Date, default: Date.now },
    referralCode: { type: String, unique: true, sparse: true }, 
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    rank: { type: String, default: 'Newbie' }, 
    lastLogin: { type: Date },
    loginStreak: { type: Number, default: 0 }, 
    postsCount: { type: Number, default: 0 }, 
    commentsCount: { type: Number, default: 0 }, 
    likesGivenCount: { type: Number, default: 0 }, 
    likesReceivedCount: { type: Number, default: 0 }, 
    referredUsersCount: { type: Number, default: 0 }, 


    dailyUpvotesCount: { type: Number, default: 0 }, 
    dailyCommentsCount: { type: Number, default: 0 }, 
    hasSaidGmToday: { type: Boolean, default: false }, 
    lastDailyTaskAssigned: { type: Date }, 

    weeklyMoonshotsCount: { type: Number, default: 0 }, 
    weeklyPostsCount: { type: Number, default: 0 }, 
    lastWeeklyTaskReset: { type: Date }, 


        profilePicture: {
        type: String, 
        default: '',   
    }, 
    twitterLink: { type: String }, 
    telegramLink: { type: String }, 

    tasks: [ 
        {
            description: { type: String, required: true },
            xpReward: { type: Number, required: true },
            completed: { type: Boolean, default: false },
            type: { type: String, enum: ['daily', 'weekly', 'onetime', 'milestone'], required: true },
            assignedDate: { type: Date }, 
            completedDate: { type: Date },
            criteria: { type: String, required: true }, 

            externalLink: { type: String }
        }
    ],
    achievements: [ 
        {
            name: { type: String, required: true },
            awardedDate: { type: Date, default: Date.now },
            badge: { type: String } 
        }
    ]
}, { timestamps: true }); 



userSchema.pre('save', function(next) {

    if (this.isModified('xp') || this.isNew) {
        const newXp = this.xp;
        let newLevel = this.level;
        let newRank = this.rank;

        if (newXp >= 10000) {
            newLevel = 5;
            newRank = 'Guru';
        } else if (newXp >= 5000) {
            newLevel = 4;
            newRank = 'Veteran';
        } else if (newXp >= 3000) {
            newLevel = 3;
            newRank = 'Pro';
        } else if (newXp >= 1500) {
            newLevel = 2;
            newRank = 'Rookie';
        } else {
            newLevel = 1;
            newRank = 'Newbie';
        }


        if (this.level !== newLevel) {
            console.log(`User ${this.email} leveled up from ${this.level} to ${newLevel}!`);
            this.level = newLevel;
        }
        if (this.rank !== newRank) {
            console.log(`User ${this.email} rank changed from ${this.rank} to ${newRank}!`);
            this.rank = newRank;
        }
    }
    next();
});

export default mongoose.model("User", userSchema);