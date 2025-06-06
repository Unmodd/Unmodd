import * as api from '../api';


export const fetchAllUsers = () => async (dispatch) => {
    try {
        const { data } = await api.getAllUsers();
        dispatch({ type: 'FETCH_ALL_USERS', payload: data });
    } catch (error) {
        console.error("Error fetching all users:", error);
    }
};


export const fetchUserProfileById = (userId) => async (dispatch) => {
    try {
        const { data } = await api.fetchUserProfileById(userId);
        dispatch({ type: 'FETCH_USER_PROFILE', payload: data });
    } catch (error) {
        console.error("Error fetching specific user profile:", error);
    }
};




export const updateProfile = (id, profileData) => async (dispatch) => {
    try {


        const { data } = await api.updateProfile(id, profileData);


        dispatch({ type: 'UPDATE_CURRENT_USER', payload: data });


        dispatch({ type: 'UPDATE_USER_IN_LIST', payload: data });

        alert('Profile updated successfully!');
        return true; 
    } catch (error) {
        console.error("Error updating profile:", error);
        alert(error.response?.data?.message || 'Failed to update profile.');
        return false; 
    }
};


export const toggleTask = (userId, taskId) => async (dispatch) => {
    try {
        const { data } = await api.toggleTask(userId, taskId);
        dispatch({ type: 'UPDATE_USER_IN_LIST', payload: data });
        dispatch({ type: 'UPDATE_CURRENT_USER', payload: data });
        alert('Task status updated!');
    } catch (error) {
        console.error("Error toggling task:", error);
        alert(error.response?.data?.message || 'Failed to update task.');
    }
};