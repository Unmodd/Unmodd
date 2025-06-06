

import User from '../models/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { addXP, checkAndAwardAchievements, updateLoginStreak, completeTaskByCriteria, assignDailyAndWeeklyTasksForUser } from './gamification.js';

export const signup = async (req, res) => {
    const { name, email, password, username, referralCode } = req.body;

    if (!username || username.trim() === '') {
        return res.status(400).json({ message: "Username is required." });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username is already taken." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);


        const initialOnetimeTasks = [
            {
                description: 'Complete Profile Setup (Username, Profile Pic, Socials)',
                type: 'onetime',
                completed: false,
                xpReward: 200,
                criteria: 'complete_profile_setup',
            },
            {
                description: 'Follow Unmodd on X (Twitter)',
                type: 'onetime',
                completed: false,
                xpReward: 200, 
                criteria: 'follow_unmodd_twitter', 
                externalLink: 'https://twitter.com/UnmoddOfficial'
            },
            {
                description: 'Join Unmodd\'s Telegram Group',
                type: 'onetime',
                completed: false,
                xpReward: 200, 
                criteria: 'join_telegram_group', 
                externalLink: 'https://t.me/UnmoddOfficial'
            },
        ];


        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username: username,
            joinedOn: new Date(),
            referralCode: uuidv4(),
            xp: 0,
            level: 1,
            rank: 'Newbie',
            lastLogin: new Date(),
            loginStreak: 1,
            postsCount: 0,
            commentsCount: 0,
            likesGivenCount: 0,
            likesReceivedCount: 0,
            referredUsersCount: 0,
            tasks: initialOnetimeTasks, 
            achievements: [],
            lastDailyTaskAssigned: new Date(),
            lastWeeklyTaskReset: new Date(),
        });


        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                newUser.referredBy = referrer._id;
                await addXP(referrer._id, 50);
                referrer.referredUsersCount = (referrer.referredUsersCount || 0) + 1;
                await referrer.save();
                await checkAndAwardAchievements(referrer._id, 'user_referred');
                console.log(`[Signup] User ${newUser.email} referred by ${referrer.email}. Referrer XP awarded.`);
            } else {
                console.log(`[Signup] Referral code ${referralCode} not found.`);
            }
        }

        await newUser.save();

        await checkAndAwardAchievements(newUser._id, 'first_login');

        const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ result: newUser, token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json('Something went wrong...');
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User doesn't Exist." });
        }

        const isPasswordCrt = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCrt) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        await assignDailyAndWeeklyTasksForUser(existingUser._id);

        const updatedUser = await updateLoginStreak(existingUser._id);
        if (!updatedUser) {
            return res.status(500).json("Failed to update user login streak.");
        }

        await completeTaskByCriteria(updatedUser._id, 'login_today');

        const token = jwt.sign({ email: updatedUser.email, id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ result: updatedUser, token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json("Something went wrong...");
    }
};


export const updateProfile = async (req, res) => {
    const { userId } = req.params; 
    const { username, profilePic, twitterLink, telegramLink } = req.body; 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        if (username) user.username = username;
        if (profilePic) user.profilePic = profilePic;
        if (twitterLink) user.twitterLink = twitterLink;
        if (telegramLink) user.telegramLink = telegramLink;

        await user.save(); 


        const isProfileComplete = user.username && user.profilePic && (user.twitterLink || user.telegramLink);
        if (isProfileComplete) {
            await completeTaskByCriteria(user._id, 'complete_profile_setup');
        }

        res.status(200).json({ message: "Profile updated successfully", user });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};