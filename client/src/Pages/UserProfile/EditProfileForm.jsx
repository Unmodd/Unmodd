import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateProfile, fetchUserProfileById } from "../../actions/users"; 
import "./UsersProfile.css";

const EditProfileForm = ({ currentUser, setSwitch, currentProfile }) => {
    const dispatch = useDispatch();

    const [name, setName] = useState(currentProfile?.name || '');
    const [username, setUsername] = useState(currentProfile?.username || '');
    const [about, setAbout] = useState(currentProfile?.about || '');
    const [tags, setTags] = useState(currentProfile?.tags?.join(', ') || '');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(currentProfile?.profilePicture || '');

    const [socialLinks, setSocialLinks] = useState({
        x: currentProfile?.socialLinks?.x || '',
        telegram: currentProfile?.socialLinks?.telegram || '',
        discord: currentProfile?.socialLinks?.discord || '',
    });


    const [completionMessage, setCompletionMessage] = useState(null);

    useEffect(() => {
        if (currentProfile) {
            console.log("[EditProfileForm] currentProfile prop updated in useEffect. Re-initializing form states.");
            setName(currentProfile.name || '');
            setUsername(currentProfile.username || '');
            setAbout(currentProfile.about || '');
            setTags(currentProfile.tags?.join(', ') || '');
            

            if (profilePicturePreview && profilePicturePreview.startsWith('blob:') && profilePicturePreview !== (currentProfile.profilePicture || '')) {
                URL.revokeObjectURL(profilePicturePreview);
                console.log("[EditProfileForm] Revoked old blob URL:", profilePicturePreview);
            }

            setProfilePicturePreview(currentProfile.profilePicture || '');
            setProfilePictureFile(null); 

            setSocialLinks({
                x: currentProfile.socialLinks?.x || '',
                telegram: currentProfile.socialLinks?.telegram || '',
                discord: currentProfile.socialLinks?.discord || '',
            });
        }

        setCompletionMessage(null); 
    }, [currentProfile]);

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        console.log("[EditProfileForm] File input change detected. Selected file:", file);


        if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
            URL.revokeObjectURL(profilePicturePreview);
            console.log("[EditProfileForm] Revoked previous blob URL:", profilePicturePreview);
        }

        if (file) {
            setProfilePictureFile(file);
            const previewUrl = URL.createObjectURL(file);
            setProfilePicturePreview(previewUrl);
            console.log("[EditProfileForm] New profile picture file selected. Preview URL (blob:):", previewUrl);
        } else {
            setProfilePictureFile(null);
            setProfilePicturePreview(currentProfile?.profilePicture || ''); 
            console.log("[EditProfileForm] File unselected. Reverted preview to current profile pic or empty.");
        }
    };

    const handleClearProfilePicture = () => {

        if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
            URL.revokeObjectURL(profilePicturePreview);
            console.log("[EditProfileForm] Revoked blob URL on clear.");
        }
        setProfilePictureFile(null);
        setProfilePicturePreview('');
        console.log("[EditProfileForm] Cleared profile picture state (file and preview).");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("[EditProfileForm] Submit button clicked.");
        setCompletionMessage(null); 

        const payload = new FormData();

        payload.append('name', name);
        payload.append('username', username);
        payload.append('about', about);
        payload.append('tags', tags);
        payload.append('socialLinks', JSON.stringify(socialLinks));

        if (profilePictureFile) {
            payload.append('profilePicture', profilePictureFile);
        } else if (profilePicturePreview === '' && currentProfile?.profilePicture) {
            payload.append('profilePicture', '');
        }

        console.log("[EditProfileForm] FormData content before dispatch (check Network tab for exact multipart data):");
        for (let pair of payload.entries()) {
            console.log(pair[0] + ': ' + (pair[1] instanceof File ? `[File: ${pair[1].name}, type: ${pair[1].type}]` : pair[1]));
        }

        try {

            const responseData = await dispatch(updateProfile(currentUser.result._id, payload));

            console.log("[EditProfileForm] Profile update dispatch returned responseData:", responseData);

            if (responseData) { 
                console.log("[EditProfileForm] Profile update successful. Closing form.");
                setSwitch(false); 


                if (responseData.taskCompletion && responseData.taskCompletion.message) {
                    setCompletionMessage(responseData.taskCompletion.message + ` You gained ${responseData.taskCompletion.xpGained} XP!`);
                    console.log("[EditProfileForm] Task completion message received:", responseData.taskCompletion.message);
                } else {
                    setCompletionMessage("Profile updated successfully!"); 
                }



                console.log(`[EditProfileForm] Dispatching fetchUserProfileById for ID: ${currentUser.result._id} to refresh UI.`);
                dispatch(fetchUserProfileById(currentUser.result._id));

            } else {
                console.log("[EditProfileForm] Profile update failed (no response data). Keeping form open.");
                setCompletionMessage("Profile update failed. Please try again."); 
            }
        } catch (error) {
            console.error("[EditProfileForm] Error during profile update dispatch:", error);
            const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
            setCompletionMessage(`Error: ${errorMessage}`);

        }
    };

    const handleCancel = () => {
        console.log("[EditProfileForm] Cancel button clicked. Closing form.");
        setSwitch(false);
        setCompletionMessage(null); 
    };

    return (
        <div className="edit-profile-form-container">
            <h2 className="edit-profile-title">Edit Your Profile</h2>
            <p className="edit-profile-title-2">Public information</p>
            {completionMessage && (
                <div className="profile-update-feedback">
                    {completionMessage}
                </div>
            )}
            <form onSubmit={handleSubmit} className="edit-profile-form">
                <label htmlFor="name">
                    <h3>Display Name</h3>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <label htmlFor="username">
                    <h3>Username (optional)</h3>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g., my_cool_username"
                    />
                    <p className="input-hint">A unique username to identify you easily.</p>
                </label>
                <label htmlFor="about">
                    <h3>About me</h3>
                    <textarea
                        id="about"
                        cols="30"
                        rows="10"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                    ></textarea>
                    <p className="input-hint">A short bio to introduce yourself.</p>
                </label>
                {}
                <h3 className="edit-profile-title-2">Social Profiles</h3>
                <label htmlFor="x">
                    <h3>X (Twitter) URL</h3>
                    <input
                        type="url"
                        id="x"
                        value={socialLinks.x}
                        onChange={(e) => setSocialLinks({ ...socialLinks, x: e.target.value })}
                        placeholder="https://x.com/yourprofile"
                    />
                </label>
                <label htmlFor="telegram">
                    <h3>Telegram URL</h3>
                    <input
                        type="url"
                        id="telegram"
                        value={socialLinks.telegram}
                        onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
                        placeholder="https://t.me/yourprofile"
                    />
                </label>
                <label htmlFor="discord">
                    <h3>Discord Server/Profile URL</h3>
                    <input
                        type="url"
                        id="discord"
                        value={socialLinks.discord}
                        onChange={(e) => setSocialLinks({ ...socialLinks, discord: e.target.value })}
                        placeholder="https://discord.gg/yourserver"
                    />
                </label>

                {}
                <label htmlFor="profilePicture">
                    <h3>Profile Picture</h3>
                    {profilePicturePreview && (
                        <div className="profile-picture-preview-container">
                            <img src={profilePicturePreview} alt="Profile Preview" className="profile-picture-preview" />
                        </div>
                    )}
                    <input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                    />
                    <p className="input-hint">Upload a new image file for your profile picture. Max size 5MB.</p> {}
                    {profilePicturePreview && (
                        <button 
                            type="button" 
                            onClick={handleClearProfilePicture}
                            className="clear-profile-picture-btn"
                        >
                            Clear Profile Picture
                        </button>
                    )}
                </label>

                <div className="form-actions">
                    <button type="submit" className="user-submit-btn">
                        Save profile
                    </button>
                    <button
                        type="button"
                        className="user-cancel-btn"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfileForm;