import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaAngleUp } from "react-icons/fa6";
import { BiCommentDots } from "react-icons/bi";
import { FaFire, FaClock, FaChartLine } from "react-icons/fa";
import moment from "moment";
import LeaderboardComponent from '../../components/Crypto/Leaderboard';
import PriceTicker from '../../components/Crypto/PriceTicker';
import PostList from '../../components/HomeMainbar/PostList';
import BannerScroller from '../../components/HomeMainbar/BannerScroller';
import '../Crypto/crypto.css';

const users = [
  { id: 1, name: 'Alice', reputation: 1200, shares: 15, avatar: 'https://via.placeholder.com/80' },
  { id: 2, name: 'Bob', reputation: 1100, shares: 12, avatar: 'https://via.placeholder.com/80' },
  { id: 3, name: 'Charlie', reputation: 1080, shares: 8, avatar: 'https://via.placeholder.com/80' },
  { id: 4, name: 'Diana', reputation: 1040, shares: 20, avatar: 'https://via.placeholder.com/80' },
  { id: 5, name: 'Ethan', reputation: 1010, shares: 18, avatar: 'https://via.placeholder.com/80' },
  { id: 6, name: 'Fiona', reputation: 1000, shares: 6, avatar: 'https://via.placeholder.com/80' }
];

const CryptoPage = () => {

    const navigate = useNavigate();
  
    const user = 1;
    const postsList = useSelector((state) => state.postsReducer);

    const checkAuth = () => {
    if (user === null) {
      alert("login or signup to create a post");
      navigate("/Auth");
    } else {
      navigate("/CreatePost");
    }
  };


  return (
    <div className="home-container-1">
      <div className="main-content">
        <div className="main-bar">
           <LeaderboardComponent users={users} />
          <div className="main-bar-header">
            {}
            <div className="filter-bar">
              <div className="filter-item">
                <FaFire className="filter-icon" />
                <span>Hot</span>
              </div>
              <div className="filter-item">
                <FaClock className="filter-icon" />
                <span>New</span>
              </div>
              <div className="filter-item">
                <FaChartLine className="filter-icon" />
                <span>Top</span>
              </div>
            </div>

            <button onClick={checkAuth} className="create-btn">
              Create Post
            </button>
          </div>

          <div>
            {postsList.data === null ? (
              <h1>Loading...</h1>
            ) : (
              <>
                <p className="post-count">{postsList.data.length} Posts</p>
                {postsList.data &&
                  postsList.data.map((post) => {
                    console.log("Post description:", post.postDescription); 

                    return (
                      <div key={post._id} className="display-post-container">
                        <div className="votes-section">
                          <FaAngleUp className="vote-icon" />
                          <p className="vote-count">
                            {post.upVote.length - post.downVote.length}
                          </p>
                        </div>

                        <div className="display-post-details">
                          {}
                          <div className="post-time-top-right">
                            {moment(post.postedOn).fromNow()}
                          </div>

                          <Link
                            to={`/Posts/${post._id}`}
                            className="post-title-link"
                          >
                            {post.postTitle.length >
                            (window.innerWidth <= 400 ? 70 : 90)
                              ? post.postTitle.substring(
                                  0,
                                  window.innerWidth <= 400 ? 70 : 90
                                ) + "..."
                              : post.postTitle}
                          </Link>

                          {}
                          <p className="post-description">
                            {post.postBody
                              ? post.postBody.substring(0, 50) + "..."
                              : ""}
                          </p>

                          <div className="display-tags-time">
                            <div className="display-tags">
                              {post.postTags.map((tag) => (
                                <p key={tag}>{tag}</p>
                              ))}
                            </div>

                            <div className="comments-section">
                              <BiCommentDots className="comment-icon" />
                              <p className="comment-count">{post.noOfComments}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        </div>

        <div className="global-chat">
          <h3>Global Chat</h3>
          {}
        </div>
      </div>
    </div>
  );
};

export default CryptoPage;