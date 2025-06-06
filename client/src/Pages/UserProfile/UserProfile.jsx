import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBirthdayCake, faPen, faTrophy, faTasks, faUser, faEnvelope,
    faCheckCircle, faCircle, faCalendarAlt, faStar, faUsers, faShareAlt,
    faComments, faThumbsUp, faFire, faAward
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";

import Avatar from "../../components/Avatar/Avatar";
import EditProfileForm from "./EditProfileForm";
import ProfileBio from "./ProfileBio";
import UserAchievements from "./UserAchievements";
import UserTasks from "./UserTasks";
import { fetchAllPosts } from '../../actions/post';
import { fetchAllUsers, fetchUserProfileById, toggleTask } from '../../actions/users';

import "./UsersProfile.css";

const UserProfile = () => {
    const { id } = useParams();
    const users = useSelector((state) => state.usersReducer);
    const postsList = useSelector((state) => state.postsReducer);
    const currentUser = useSelector((state) => state.currentUserReducer);



    let currentProfile = users.find((user) => user._id === id);

    const [Switch, setSwitch] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [copiedReferral, setCopiedReferral] = useState(false);

    console.log("--- UserProfile Component Render ---");
    console.log("URL ID (id):", id);
    console.log("Logged-in User (currentUser):", currentUser);
    console.log("Logged-in User ID (currentUser?.result?._id):", currentUser?.result?._id);
    console.log("Current Profile Being Viewed (currentProfile):", currentProfile);
    console.log("Edit Button Condition (currentUser?.result?._id === id):", currentUser?.result?._id === id);
    console.log("Switch state for EditProfileForm:", Switch);
    console.log("------------------------------------");

    const dispatch = useDispatch();



    useEffect(() => {


        const userInStore = users.find(user => user._id === id);
        if (id && (!userInStore || !userInStore.xp)) {
            console.log(`[UserProfile useEffect 1] Fetching user profile for ID: ${id}`);
            dispatch(fetchUserProfileById(id));
        }


        if (users.length === 0) {
            console.log("[UserProfile useEffect 1] Fetching all users.");
            dispatch(fetchAllUsers());
        }


        if (!postsList.data || postsList.data.length === 0) {
            console.log("[UserProfile useEffect 1] Fetching all posts.");
            dispatch(fetchAllPosts());
        }



    }, [dispatch, id, users.length, postsList.data?.length]);





    useEffect(() => {



        if (currentUser?.result?._id === id) {
            console.log(`[UserProfile useEffect 2] Re-fetching logged-in user's profile (${id}) due to currentUser change.`);
            dispatch(fetchUserProfileById(id));
        }
    }, [currentUser?.result?._id, id, dispatch]);



    const handleTaskToggle = async (taskId) => {

        if (!currentUser?.result || currentUser.result._id !== currentProfile._id) {
            alert("You can only toggle your own tasks!");
            return;
        }
        await dispatch(toggleTask(currentUser.result._id, taskId));



        dispatch(fetchUserProfileById(id));
    };


    const copyReferralCode = () => {
        if (currentProfile?.referralCode) {
            navigator.clipboard.writeText(currentProfile.referralCode);
            setCopiedReferral(true);
            setTimeout(() => setCopiedReferral(false), 2000);
        }
    };


    if (!currentProfile) {
        return (
            <motion.div
                className="home-container-1 user-profile-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="home-container-2 user-profile-content">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Loading profile...
                    </motion.h1>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="home-container-1 user-profile-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div className="home-container-2 user-profile-content">
                <motion.section
                    className="profile-header-section"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="user-details-container">
                        {currentProfile?.profilePicture ? (
                            <motion.img
                                src={currentProfile.profilePicture}
                                alt="User Logo"
                                className="user-profile-logo"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                            />
                        ) : (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <Avatar
                                    backgroundColor="#00BFFF"
                                    borderRadius="50%"
                                    color="black"
                                    fontSize="60px"
                                    px="60px"
                                    py="40px"
                                >
                                    {currentProfile?.name.charAt(0).toUpperCase()}
                                </Avatar>
                            </motion.div>
                        )}

                        <motion.div
                            className="user-info-main"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.h1
                                className="user-display-name"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                            >
                                {currentProfile?.name}
                            </motion.h1>
                            {currentProfile?.username && (
                                <motion.p
                                    className="user-username"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                >
                                    @{currentProfile.username}
                                </motion.p>
                            )}
                            <motion.p
                                className="user-joined-date"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                            >
                                <FontAwesomeIcon icon={faCalendarAlt} /> Joined{" "}
                                {moment(currentProfile?.joinedOn).fromNow()}
                            </motion.p>

                            {}
                            <div className="gamification-stats">
                                <motion.p
                                    className="user-gamification-stat"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                >
                                    <FontAwesomeIcon icon={faStar} /> XP: {currentProfile?.xp || 0}
                                </motion.p>
                                <motion.p
                                    className="user-gamification-stat"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.3 }}
                                >
                                    <FontAwesomeIcon icon={faTrophy} /> Level: {currentProfile?.level || 1}
                                </motion.p>
                                <motion.p
                                    className="user-gamification-stat"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.3 }}
                                >
                                    <FontAwesomeIcon icon={faAward} /> Rank: {currentProfile?.rank || 'Newbie'}
                                </motion.p>
                                <motion.p
                                    className="user-gamification-stat"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, duration: 0.3 }}
                                >
                                    <FontAwesomeIcon icon={faFire} /> Login Streak: {currentProfile?.loginStreak || 0} days
                                </motion.p>
                                <motion.p
                                    className="user-gamification-stat"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 0.3 }}
                                >
                                    <FontAwesomeIcon icon={faEnvelope} /> Posts: {currentProfile?.postsCount || 0}
                                </motion.p>
                                <motion.p
                                    className="user-gamification-stat"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.3 }}
                                >
                                    <FontAwesomeIcon icon={faComments} /> Comments: {currentProfile?.commentsCount || 0}
                                </motion.p>
                                <motion.p
                                    className="user-gamification-stat"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0, duration: 0.3 }}
                                >
                                    <FontAwesomeIcon icon={faThumbsUp} /> Likes Given: {currentProfile?.likesGivenCount || 0}
                                </motion.p>
                                {currentProfile?.referredBy && (
                                    <motion.p
                                        className="user-gamification-stat"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.1, duration: 0.3 }}
                                    >
                                        <FontAwesomeIcon icon={faUsers} /> Referred by: {currentProfile.referredBy}
                                    </motion.p>
                                )}
                                {currentProfile?.referredUsersCount !== undefined && (
                                    <motion.p
                                        className="user-gamification-stat"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.2, duration: 0.3 }}
                                    >
                                        <FontAwesomeIcon icon={faUsers} /> Users Referred: {currentProfile.referredUsersCount}
                                    </motion.p>
                                )}
                                {currentUser?.result?._id === id && currentProfile?.referralCode && (
                                    <motion.div
                                        className="referral-code-section"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.3, duration: 0.3 }}
                                    >
                                        <p>
                                            <FontAwesomeIcon icon={faShareAlt} /> Your Referral Code: **{currentProfile.referralCode}**
                                        </p>
                                        <button
                                            onClick={copyReferralCode}
                                            className="copy-referral-btn"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ duration: 0.1 }}
                                        >
                                            {copiedReferral ? 'Copied!' : 'Copy Code'}
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                            {}
                        </motion.div>
                    </div>

                    {}
                    {currentUser?.result?._id === id && (
                        <motion.button
                            whileHover={{ scale: 1.08, backgroundColor: "#0069d9" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            type="button"
                            onClick={() => setSwitch(true)}
                            className="edit-profile-btn"
                        >
                            <FontAwesomeIcon icon={faPen} /> Account Settings
                        </motion.button>
                    )}
                </motion.section>

                {}
                <motion.div
                    className="profile-tabs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    {[
                        { key: 'profile', icon: faUser, label: 'Profile' },
                        { key: 'achievements', icon: faTrophy, label: `Achievements (${currentProfile?.achievements?.length || 0})` },
                        { key: 'tasks', icon: faTasks, label: `Daily Tasks (${currentProfile?.tasks?.filter(task => !task.completed).length || 0})` }
                    ].map(tab => (
                        <motion.button
                            key={tab.key}
                            className={`profile-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.1 }}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <FontAwesomeIcon icon={tab.icon} /> <motion.span>{tab.label}</motion.span>
                        </motion.button>
                    ))}
                </motion.div>

                {}
                <motion.div className="profile-tab-content">
                    <AnimatePresence mode="wait">
                        {Switch ? (
                            <motion.div
                                key="edit-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <EditProfileForm
                                    currentUser={currentUser}
                                    setSwitch={setSwitch}
                                    currentProfile={currentProfile}
                                />
                            </motion.div>
                        ) : activeTab === 'profile' ? (
                            <motion.div
                                key="bio"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ProfileBio currentProfile={currentProfile} />
                            </motion.div>
                        ) : activeTab === 'achievements' ? (
                            <motion.div
                                key="achievements"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <UserAchievements achievements={currentProfile?.achievements || []} />
                            </motion.div>
                        ) : activeTab === 'tasks' ? (
                            <motion.div
                                key="tasks"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <UserTasks
                                    tasks={currentProfile?.tasks || []}
                                    userId={currentUser?.result?._id}
                                    onToggleTask={handleTaskToggle}
                                    isCurrentUserProfile={currentUser?.result?._id === id}
                                />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default UserProfile;