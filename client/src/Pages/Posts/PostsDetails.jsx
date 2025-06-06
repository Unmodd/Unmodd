

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import copy from 'copy-to-clipboard';
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";


import { MentionsInput, Mention } from 'react-mentions';
import defaultStyle from '../CreatePost/defaultStyle';
import mentionStyle from '../CreatePost/mentionStyle';

import './Posts.css';
import Avatar from '../../components/Avatar/Avatar';
import DisplayComment from './DisplayComment'; 
import { postComment, deletePost, votePost } from '../../actions/post';
import * as api from '../../api'; 


const fetchUsers = async (query) => {
    if (!query) return [];
    try {
        console.log(`[PostsDetails] Fetching users for query: ${query}`);

        const { data } = await api.searchUsers(query);
        console.log(`[PostsDetails] User suggestions API response:`, data);



        return data.map(user => ({
            id: user._id,
            display: user.username || user.name, 
            username: user.username || user.name 
        }));
    } catch (error) {
        console.error('[PostsDetails] Failed to fetch user suggestions:', error);
        return [];
    }
};



const PostsDetails = () => {
    const { id } = useParams();
    const postsList = useSelector((state) => state.postsReducer);
    const [commentText, setCommentText] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.currentUserReducer);
    const location = useLocation();
    const shareBaseUrl = window.location.origin;

    const [suggestions, setSuggestions] = useState([]); 


    useEffect(() => {
        console.log("[PostsDetails] Component mounted or dependencies changed.");
        console.log("[PostsDetails] Current URL ID (from useParams):", id);
        console.log("[PostsDetails] Posts List (from Redux):", postsList);
        console.log("[PostsDetails] Current User (from Redux):", currentUser);
    }, [id, postsList, currentUser]);


    const currentPost = postsList.data?.find((post) => post._id === id);


    useEffect(() => {
        console.log("[PostsDetails] currentPost after find:", currentPost);
        if (currentPost && !currentPost.comment) {
            console.warn("[PostsDetails] currentPost.comment is undefined. Check your backend data structure for comments.");
            console.log("[PostsDetails] currentPost.comments (if it exists):", currentPost.comments);
            console.log("[PostsDetails] currentPost.answer (if it exists):", currentPost.answer);
        }
    }, [currentPost]);



    const onCommentMentionsAdd = useCallback(async (query, callback) => {
        const userSuggestions = await fetchUsers(query); 

        callback(userSuggestions);
    }, []);

    const handlePostCom = (e) => {
        e.preventDefault();
        console.log("[PostsDetails] handlePostCom called.");

        if (!currentUser || !currentUser.result) {
            alert('Login or Signup to post a comment');
            navigate('/Auth');
            console.log("[PostsDetails] User not logged in. Redirecting to Auth.");
            return;
        }

        if (commentText.trim() === '') {
            alert('Enter a comment before submitting');
            console.log("[PostsDetails] Comment text is empty.");
            return;
        }

        const currentCommentsCount = currentPost?.comment?.length || 0;
        console.log("[PostsDetails] Current comments count before new comment:", currentCommentsCount);

        dispatch(
            postComment({
                id,
                noOfComments: currentCommentsCount + 1,
                commentBody: commentText.trim(),
                userCommented: currentUser.result.name,
                userId: currentUser.result._id,
            })
        );
        setCommentText('');
        console.log("[PostsDetails] Comment dispatched and input cleared.");
    };

    const handleShare = () => {
        const shareUrl = `${shareBaseUrl}${location.pathname}`;
        copy(shareUrl);
        alert(`Link Copied! Share this post: ${shareUrl}`);
        console.log("[PostsDetails] Share function called. URL copied:", shareUrl);
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            dispatch(deletePost(id, navigate));
            console.log("[PostsDetails] Delete post confirmed and dispatched for ID:", id);
        } else {
            console.log("[PostsDetails] Delete post cancelled.");
        }
    };

    const handleVote = (type) => {
        console.log(`[PostsDetails] Vote function called: ${type}`);
        if (!currentUser) {
            alert(`Login or Signup to ${type === 'upVote' ? 'upvote' : 'downvote'} a post`);
            navigate('/Auth');
            console.log("[PostsDetails] User not logged in for voting. Redirecting to Auth.");
            return;
        }
        dispatch(votePost(id, type));
        console.log(`[PostsDetails] Vote dispatched for post ID: ${id}, type: ${type}`);
    };

    if (!currentPost) {
        console.log("[PostsDetails] currentPost is null or undefined. Showing loading/not found state.");
        return (
            <div className="post-details-page">
                <div className="loading-state">
                    <h1>Loading Post...</h1>
                    {postsList.data && postsList.data.length === 0 && (
                        <p className="loading-message">No post found with this ID. It might have been deleted or never existed.</p>
                    )}
                </div>
            </div>
        );
    }

    const voteCount = currentPost.upVote.length - currentPost.downVote.length;
    const voteColor =
        voteCount > 0
            ? '#00BFFF'
            : voteCount < 0
                ? '#FF6347'
                : '#7a8a9a';


    console.log("[PostsDetails] About to render DisplayComment with currentPost:", currentPost);


    return (
        <div className="post-details-page">
            <section className="post-details-container glass-card">
                <div className="post-votes">
                    <FaAngleUp
                        className="votes-icon upvote-icon"
                        onClick={() => handleVote('upVote')}
                    />
                    <p className="vote-count" style={{ color: voteColor }}>{voteCount}</p>
                    <FaAngleDown
                        className="votes-icon downvote-icon"
                        onClick={() => handleVote('downVote')}
                    />
                </div>
                <h1 className="post-title">{currentPost.postTitle}</h1>

                <div className="post-details-container-2">
                    <div style={{ width: '100%' }}>
                        <div className="post-content-card">
                            <p className="post-body">
                                {currentPost.postBody}
                            </p>

                            {currentPost.mediaUrls && currentPost.mediaUrls.length > 0 && (
                                <div className="post-media-gallery">
                                    {currentPost.mediaUrls.map((media, index) => {
                                        const url = typeof media === 'string' ? media : media.url;
                                        const type =
                                            typeof media === 'string'
                                                ? url.split('.').pop().toLowerCase()
                                                : media.type;

                                        if (['mp4', 'webm', 'ogg'].includes(type)) {
                                            return (
                                                <video
                                                    key={index}
                                                    src={url}
                                                    controls
                                                    className="post-media"
                                                    preload="metadata"
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            );
                                        } else if (['mp3', 'wav'].includes(type)) {
                                            return (
                                                <audio
                                                    key={index}
                                                    src={url}
                                                    controls
                                                    className="post-media"
                                                    preload="metadata"
                                                >
                                                    Your browser does not support the audio tag.
                                                </audio>
                                            );
                                        } else if (
                                            ['gif', 'png', 'jpg', 'jpeg', 'webp'].includes(type)
                                        ) {
                                            return (
                                                <img
                                                    key={index}
                                                    src={url}
                                                    alt="Post Media"
                                                    className="post-media"
                                                    loading="lazy"
                                                />
                                            );
                                        } else {
                                            return <p key={index} className="unsupported-media-text">Unsupported media type: {type}</p>;
                                        }
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="post-details-tags">
                            {currentPost.postTags.map((tag) => {
                                const MAX_TAG_LENGTH = 20;
                                const truncatedTag = tag.length > MAX_TAG_LENGTH
                                    ? tag.substring(0, MAX_TAG_LENGTH) + '...'
                                    : tag;

                                console.log(`[PostsDetails] Tag being mapped: ${tag}, truncated: ${truncatedTag}`);

                                return (
                                    <Link to={`/Tags?tag=${encodeURIComponent(tag)}`} key={tag} className="tag-pill">
                                        {truncatedTag}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="post-actions-user">
                            <div>
                                <button type="button" onClick={handleShare} className="action-btn share-btn">
                                    Share
                                </button>
                                {currentUser?.result?._id === currentPost?.userId && (
                                    <button type="button" onClick={handleDelete} className="action-btn delete-btn">
                                        Delete
                                    </button>
                                )}
                            </div>
                            <div>
                                <p>Posted {moment(currentPost.postedOn).fromNow()}</p>
                                <Link
                                    to={`/Users/${currentPost.userId}`}
                                    className="user-link"
                                    style={{ color: '#00fff6' }}
                                >
                                    <Avatar backgroundColor="#00BFFF" color="#000" px="12px" py="5px">
                                        {currentPost.userPosted.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <div>{currentPost.userPosted}</div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <h3>{currentPost.noOfComments} Comments</h3>
            {}
            {currentPost.noOfComments !== 0 && currentPost.comment && ( 
                <section className="comments-section glass-card">
                    <DisplayComment
                        post={currentPost} 
                        handleShare={handleShare}


                    />
                </section>
            )}

            <section className="post-com-container glass-card">
                <h3>Your Comment</h3>
                <form onSubmit={handlePostCom}>
                    <MentionsInput
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        style={defaultStyle}
                        placeholder="Type your comment here. Use @ to mention users!"
                        className="comment-mentions-input"
                    >
                        <Mention
                            trigger="@"
                            data={onCommentMentionsAdd} 
                            style={mentionStyle}
                            displayTransform={(id, display) => `@${display}`}
                            appendSpaceOnAdd={true}
                        />
                    </MentionsInput>
                    <br />
                    <input
                        type="Submit"
                        className="post-com-btn submit-comment-btn"
                        value="Post Your Comment"
                    />
                </form>
                <p className="browse-other-posts">
                    Browse other Post tagged
                    {currentPost.postTags.map((tag) => (
                        <Link
                            to={`/Tags?tag=${encodeURIComponent(tag)}`}
                            key={tag}
                            className="com-tags browse-tag-link"
                        >{` ${tag} `}</Link>
                    ))}{' '}
                    or
                    <Link
                        to="/CreatePost"
                        className="create-post-link"
                    >
                        {' '}
                        create your own post.
                    </Link>
                </p>
            </section>
        </div>
    );
};

export default PostsDetails;