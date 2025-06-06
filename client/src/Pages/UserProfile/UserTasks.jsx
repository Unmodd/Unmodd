
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCircle } from "@fortawesome/free-solid-svg-icons";
import * as api from '../../api/index'; 

const UserTasks = ({ tasks, userId, isCurrentUserProfile, onTaskCompleted }) => {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    const dailyTasks = tasks.filter(task => task.type === 'daily');
    const otherTasks = tasks.filter(task => task.type !== 'daily');


    useEffect(() => {
        console.log("UserTasks component received tasks:", tasks);
    }, [tasks]);


    const handleManualTaskCompletion = async (taskId) => {
        try {
            console.log(`Attempting to complete manual task ${taskId} for user ${userId}`);
            const response = await api.completeManualTask(userId, taskId);
            console.log('Manual task completion response:', response.data);

            if (onTaskCompleted) {

                onTaskCompleted(response.data.user);
            }
        } catch (error) {
            console.error('Error completing manual task:', error.response?.data || error.message);
            alert(`Failed to complete task: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <motion.div
            className="user-tasks-container"
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
        >
            {dailyTasks.length > 0 && (
                <div className="task-section">
                    <h3>Daily Tasks</h3>
                    {dailyTasks.map(task => {
                        console.log("Rendering daily task:", task);
                        return (
                            <motion.div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`} variants={itemVariants}>
                                <span className="task-name">{task.description}</span>
                                {task.completed ? (
                                    <FontAwesomeIcon icon={faCheckCircle} className="task-status-icon completed" />
                                ) : (

                                    task.criteria === 'like_retweet_unmodd_tweet' ? (
                                        <>
                                            <button
                                                onClick={() => handleManualTaskCompletion(task._id)}
                                                className="complete-task-button"
                                                title="Click this after you've liked and retweeted the tweet!"
                                                disabled={!isCurrentUserProfile} 
                                            >
                                                Mark Done
                                            </button>
                                            {task.externalLink && ( 
                                                <a href={task.externalLink} target="_blank" rel="noopener noreferrer" className="task-external-link">
                                                    Go to Tweet
                                                </a>
                                            )}
                                        </>
                                    ) : (

                                        <FontAwesomeIcon icon={faCircle} className="task-status-icon pending" />
                                    )
                                )}
                                <span className="task-xp">+ {task.xpReward} XP</span>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {otherTasks.length > 0 && (
                <div className="task-section">
                    <h3>Other Tasks</h3>
                    {otherTasks.map(task => (
                        <motion.div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`} variants={itemVariants}>
                            <span className="task-name">{task.description}</span>
                            {task.completed ? (
                                <FontAwesomeIcon icon={faCheckCircle} className="task-status-icon completed" />
                            ) : (

                                (task.criteria === 'follow_unmodd_twitter' || task.criteria === 'join_telegram_group') ? (
                                    <>
                                        <button
                                            onClick={() => handleManualTaskCompletion(task._id)}
                                            className="complete-task-button"
                                            title={`Click this after you've ${task.description.toLowerCase()}!`} 
                                            disabled={!isCurrentUserProfile}
                                        >
                                            Mark Done
                                        </button>
                                        {task.externalLink && (
                                            <a href={task.externalLink} target="_blank" rel="noopener noreferrer" className="task-external-link">
                                                Go to Link
                                            </a>
                                        )}
                                    </>
                                ) : (

                                    <FontAwesomeIcon icon={faCircle} className="task-status-icon pending" />
                                )
                            )}
                            <span className="task-xp">+ {task.xpReward} XP</span>
                        </motion.div>
                    ))}
                </div>
            )}

            {tasks.length === 0 && (
                <p className="no-tasks-message">No tasks available yet.</p>
            )}
            {!isCurrentUserProfile && tasks.length > 0 && (
                <p className="view-only-message">Viewing tasks of another user.</p>
            )}
        </motion.div>
    );
};

export default UserTasks;