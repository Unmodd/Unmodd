import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faTelegram, faDiscord } from "@fortawesome/free-brands-svg-icons";
import "./UsersProfile.css";

const ProfileBio = ({ currentProfile }) => {

    console.log("ProfileBio: Component Rendered.");
    console.log("ProfileBio: currentProfile received:", currentProfile);
    console.log("ProfileBio: About:", currentProfile?.about);
    console.log("ProfileBio: Tags:", currentProfile?.tags);
    console.log("ProfileBio: Social Links:", currentProfile?.socialLinks);


    return (
        <div className="profile-bio-container">
            {}
            <div className="profile-section">
                <h4>About Me</h4>
                {currentProfile?.about ? (
                    <p>{currentProfile?.about}</p>
                ) : (
                    <p className="no-info-text">No bio found.</p>
                )}
            </div>

            {}
            <div className="profile-section">
                <h4>Social Profiles</h4>
                <div className="social-links-list">
                    {currentProfile?.socialLinks?.x ? (
                        <a href={currentProfile.socialLinks.x} target="_blank" rel="noopener noreferrer" className="social-link x-link">
                            <FontAwesomeIcon icon={faXTwitter} /> X (Twitter)
                        </a>
                    ) : (
                        <p className="no-info-text">No X profile linked.</p>
                    )}
                    {currentProfile?.socialLinks?.telegram ? (
                        <a href={currentProfile.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="social-link telegram-link">
                            <FontAwesomeIcon icon={faTelegram} /> Telegram
                        </a>
                    ) : (
                        <p className="no-info-text">No Telegram linked.</p>
                    )}
                    {currentProfile?.socialLinks?.discord ? (
                        <a href={currentProfile.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="social-link discord-link">
                            <FontAwesomeIcon icon={faDiscord} /> Discord
                        </a>
                    ) : (
                        <p className="no-info-text">No Discord linked.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileBio;