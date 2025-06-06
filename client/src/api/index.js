import axios from 'axios';


const BASE_URL = 'http://localhost:5000'; 
console.log("[API] Axios Base URL:", BASE_URL);

const API = axios.create({ baseURL: BASE_URL }); 


API.interceptors.request.use((req) => {
    const profile = localStorage.getItem('profile'); 
    if (profile) {
        try {
            const parsedProfile = JSON.parse(profile);
            if (parsedProfile && parsedProfile.token) {
                req.headers.authorization = `Bearer ${parsedProfile.token}`;
                console.log("[API Interceptor] Token attached for URL:", req.url);
            } else {
                console.warn("[API Interceptor] Token not found in parsed profile, URL:", req.url);
            }
        } catch (e) {
            console.error("[API Interceptor] Error parsing 'profile' from localStorage:", e);
            localStorage.removeItem('profile'); 
        }
    } else {
        console.log("[API Interceptor] No 'profile' found in localStorage for URL:", req.url);
    }
    console.log("[API Interceptor] Outgoing Request - Method:", req.method, "URL:", req.url, "Headers:", req.headers);
    return req;
}, (error) => {
    console.error("[API Interceptor] Request Error:", error);
    return Promise.reject(error);
});


API.interceptors.response.use((response) => {
    console.log("[API Interceptor] Successful Response - URL:", response.config.url, "Status:", response.status, "Data:", response.data);
    return response;
}, (error) => {
    if (error.response) {
        console.error("[API Interceptor] Response Error - Status:", error.response.status, "Data:", error.response.data, "Headers:", error.response.headers);
    } else if (error.request) {
        console.error("[API Interceptor] No response received - Request:", error.request);
    } else {
        console.error("[API Interceptor] Error setting up request:", error.message);
    }
    return Promise.reject(error);
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem('Profile')) {
        req.headers.authorization = `Bearer ${JSON.parse(localStorage.getItem('Profile')).token}`;
    }
    return req;
});



export const checkDailyGM = () => API.post('/gamification/daily-gm');
export const completeDailyTask = (taskCriteria) => API.post('/gamification/complete-daily-task', { taskCriteria });
export const getActiveDailyTasks = () => API.get('/gamification/daily-tasks');
export const createPost = (postData) => API.post('/posts/CreatePost', postData);
export const getAllPosts = () => API.get('/posts/get');
export const deletePost = (id) => API.delete(`/posts/delete/${id}`);
export const votePost = (id, value, userId) => API.patch(`/posts/vote/${id}`, { value, userId });

export const postComment = (postId, commentData) => API.post(`/comment/${postId}`, commentData);
export const deleteComment = (commentId, data) => API.delete(`/comment/${commentId}`, { data });
export const fetchPostSuggestions = (query) => API.get(`/posts/suggestions?q=${query}`);
export const searchUsers = (query) => API.get(`/api/users/search?q=${query}`);



export const getAllUsers = () => {
    console.log("[API] Calling getAllUsers");
    return API.get('/api/users/all');
};

export const updateProfile = (id, updateData) => {
    console.log(`[API] Calling updateProfile for ID: ${id} with data:`, updateData);
    return API.patch(`/api/users/update/${id}`, updateData);
};

export const logIn = (authData) => {
    console.log("[API] Calling logIn with data:", authData);
    return API.post('/api/users/login', authData);
};
export const signUp = (authData) => {
    console.log("[API] Calling signUp with data:", authData);
    return API.post('/api/users/signup', authData);
};

export const fetchUserProfileById = (id) => {
    console.log(`[API] Calling fetchUserProfileById for ID: ${id}`);
    return API.get(`/api/users/${id}`);
};
export const toggleTask = (userId, taskId) => {
    console.log(`[API] Calling toggleTask for User ID: ${userId}, Task ID: ${taskId}`);
    return API.patch(`/api/users/${userId}/tasks/${taskId}/toggle`);
};







export const fetchNotifications = () => API.get('/notifications'); 
export const markNotificationsAsRead = (notificationIds) => API.put('/notifications/mark-read', { notificationIds }); 
export const getUnreadNotificationCount = () => API.get('/notifications/unread-count'); 


export const completeManualTask = (userId, taskId) => {
    console.log(`[API] Calling completeManualTask for User ID: ${userId}, Task ID: ${taskId}`);
    return API.post(`/api/users/${userId}/tasks/complete-manual`, { taskId });
};



export const togglePinPost = (id) => {
    console.log(`[API] Calling togglePinPost for ID: ${id}`);

    return API.post(`/posts/pin/${id}`, {});
};

export const boostUpvotes = (postId, amount) => {
    console.log(`[API] Calling boostUpvotes for Post ID: ${postId} with amount: ${amount}`);
    return API.patch(`/posts/boost/${postId}`, { amount });
};


export default API;