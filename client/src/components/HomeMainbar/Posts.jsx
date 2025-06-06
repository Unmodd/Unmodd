import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { togglePinPost } from '../../actions/post';

const Posts = ({ post, user }) => {
    const dispatch = useDispatch();
    const isAdmin = user && user._id === process.env.REACT_APP_ADMIN_ID;
    console.log(`[Posts.jsx] User ID: ${user?._id}, Admin ID: ${process.env.REACT_APP_ADMIN_ID}, Is Admin: ${isAdmin}`);


    const handlePinPostClick = () => {
        if (isAdmin) {
            console.log(`[Posts.jsx] Admin attempting to toggle pin for post ID: ${post._id}`);
            dispatch(togglePinPost(post._id));
        } else {
            console.warn(`[Posts.jsx] Non-admin user attempted to click pin button (should be hidden).`);
        }
    };

    return (
        <div className='display-post-container'>
            <div className='display-votes-com'>
                <p>{post.upVote.length - post.downVote.length}</p>
                <p>Votes</p>
            </div>
            <div className='display-votes-com'>
                <p>{post.noOfComments}</p>
                <p>Comments</p>
            </div>
            <div className="display-post-details">
                <Link to={`/Posts/${post._id}`} className='post-title-link'>
                    {post.postTitle.length > (window.innerWidth <= 400 ? 70 : 90)
                        ? post.postTitle.substring(0, window.innerWidth <= 400 ? 70 : 90) + "..."
                        : post.postTitle}
                </Link>
                <div className='display-tags-time'>
                    <div className='display-tags'>
                        {post.postTags.map((tag) => (
                            <p key={tag}>{tag}</p>
                        ))}
                    </div>
                    <p className='display-time'>
                        Posted {moment(post.postedOn).fromNow()} {post.userPosted}
                        {post.pinned && <span className="pinned-label">🔥 Boosted</span>}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handlePinPostClick}
                        className="pin-button"
                        title={post.pinned ? 'Click to unpin this post' : 'Click to pin this post'}
                    >
                        {post.pinned ? 'Unpin Post' : '📌 Pin Post'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Posts;