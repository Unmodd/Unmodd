import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

const Posts = ({ post, user }) => {
  const handlePinPost = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/posts/pin/${post._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`, 
        },
      });
      const data = await res.json();
      console.log('Pin response:', data);

    } catch (err) {
      console.error('Error pinning post:', err);
    }
  };

  const isAdmin = user && user._id === process.env.REACT_APP_ADMIN_ID;

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
          </p>
        </div>
        {isAdmin && (
          <button onClick={handlePinPost} className="pin-button">
            📌 Pin
          </button>
        )}
      </div>
    </div>
  );
};

export default Posts;
