
import React from 'react';
import { motion } from 'framer-motion';
import moment from 'moment';

const UserAchievements = ({ achievements }) => {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            className="user-achievements-container"
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
            {achievements.length > 0 ? (
                achievements.map(achievement => (
                    <motion.div key={achievement._id} className="achievement-card" variants={itemVariants}>
                        <h4 className="achievement-name">{achievement.name}</h4>
                        <p className="achievement-description">{achievement.description}</p>
                        <p className="achievement-date">Earned: {moment(achievement.earnedOn).format('MMM D, YYYY')}</p>
                    </motion.div>
                ))
            ) : (
                <p className="no-achievements-message">No achievements earned yet.</p>
            )}
        </motion.div>
    );
};

export default UserAchievements;