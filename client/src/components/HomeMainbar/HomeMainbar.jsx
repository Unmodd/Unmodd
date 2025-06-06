import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./HomeMainbar.css";
import PostList from "./PostList";
import BannerScroller from './BannerScroller';

const HomeMainbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.currentUserReducer);
  const postsList = useSelector((state) => state.postsReducer);

  const checkAuth = () => {
    if (!user) {
      alert("Login or signup to create a post");
      navigate("/Auth");
    } else {
      navigate("/CreatePost");
    }
  };

  return (
    <div className="main-bar">
      <div className="main-bar-header">
        <BannerScroller />
        <button onClick={checkAuth} className="create-btn">
          Create Post
        </button>
      </div>

      <div>
        {!postsList?.data ? (
          <h1>Loading...</h1>
        ) : (
          <>
            <p>{postsList.data.length} Posts</p>
            <PostList postsList={postsList.data} user={user} />
          </>
        )}
      </div>
    </div>
  );
};

export default HomeMainbar;
