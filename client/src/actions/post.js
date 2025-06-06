

import * as api from '../api'





export const createPost = (postData, navigate) => async (dispatch) => {
    try {

        const { data } = await api.createPost(postData);

        dispatch({ type: "POST_POST", payload: data });
        dispatch(fetchAllPosts());



        navigate(`/${postData.category.toLowerCase()}`);

    } catch (error) {
        console.error("Error creating post:", error); 
        alert(`Failed to create post: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
};

export const fetchAllPosts = () => async (dispatch) => {
    try {
        const { data } = await api.getAllPosts();
        dispatch({ type: 'FETCH_ALL_POSTS', payload: data });
    } catch (error) {
        console.error("Error fetching all posts:", error);
    }
};

export const deletePost = (id, navigate) => async (dispatch) => {
    try {
        await api.deletePost(id);
        dispatch(fetchAllPosts());

        navigate('/');
    } catch (error) {
        console.error("Error deleting post:", error);
        alert(`Failed to delete post: ${error.response?.data?.message || error.message}`);
    }
};

export const votePost = (id, value) => async (dispatch) => {
    try {

        await api.votePost(id, value);
        dispatch(fetchAllPosts()); 
    } catch (error) {
        console.error("Error voting on post:", error);
        alert(`Failed to vote: ${error.response?.data?.message || error.message}`);
    }
};

export const postComment = (commentData) => async (dispatch, getState) => { 
    try {
        const { id: postId, commentBody, userCommented } = commentData; 


        const User = getState().currentUserReducer; 
        const userId = User?.result?._id; 

        if (!userId) {
            console.error("Frontend: User not logged in. Cannot post comment.");
            alert("Please log in to post a comment.");
            return; 
        }



        const { data } = await api.postComment(postId, { commentBody, userCommented, userId });
        console.log("Comment posted successfully:", data.comment);


        dispatch(fetchAllPosts());

    } catch (error) {
        console.error("Frontend: Error posting comment:", error.response?.data?.message || error.message);
        alert(`Failed to post comment: ${error.response?.data?.message || error.message}`);
    }
};

export const deleteComment = (postId, commentId, noOfComments) => async (dispatch) => {
    try {

        await api.deleteComment(commentId, { postId }); 


        dispatch(fetchAllPosts());
    } catch (error) {
        console.error("Error deleting comment:", error);
        alert(`Failed to delete comment: ${error.response?.data?.message || error.message}`);
    }
};

export const togglePinPost = (id) => async (dispatch) => {
    try {
        await api.togglePinPost(id);
        dispatch(fetchAllPosts()); 
    } catch (error) {
        console.error("Failed to toggle pin post", error);
        alert(`Failed to toggle pin: ${error.response?.data?.message || error.message}`);
    }
};

export const boostUpvotes = (postId, count) => async (dispatch) => {
    try {
        await api.boostUpvotes(postId, count);
        dispatch(fetchAllPosts());
    } catch (error) {
        console.error("Error boosting upvotes:", error);
        alert(`Failed to boost upvotes: ${error.response?.data?.message || error.message}`);
    }
};