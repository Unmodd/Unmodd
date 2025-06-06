import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaAngleUp } from "react-icons/fa6";
import { BiCommentDots } from "react-icons/bi";
import { FaFire, FaClock } from "react-icons/fa";
import moment from "moment";
import axios from "axios";
import { io } from "socket.io-client";

import "./News.css";
import BannerScroller from '../../components/HomeMainbar/BannerScroller';
import { togglePinPost, boostUpvotes } from '../../actions/post';
import GroupDock from '../../components/GroupDock'; 
import CryptoTicker from '../../components/CryptoTicker';
import ChatWindow from '../../components/Chat/ChatWindow';
import '../../components/Chat/Chat.css';

const News = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const dispatch = useDispatch();
    const socket = useRef(null);
    const [boostAmount, setBoostAmount] = useState(100);
    const navigate = useNavigate();
    const user = useSelector((state) => state.currentUserReducer);

    const isAdmin = user?.result?._id === process.env.REACT_APP_ADMIN_ID;

    const postsList = useSelector((state) => state.postsReducer);

    const CATEGORY_NAME = "News";

    const [currentFilter, setCurrentFilter] = useState('hot');

    const filteredByCategoryPosts = postsList.data
        ? postsList.data.filter(post => post.category === CATEGORY_NAME)
        : [];

    const sortedAndFilteredPosts = filteredByCategoryPosts.length > 0
        ? [...filteredByCategoryPosts].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            if (currentFilter === 'new') {
                return new Date(b.postedOn) - new Date(a.postedOn);
            } else { 
                const scoreA = a.upVote.length - a.downVote.length;
                const scoreB = b.upVote.length - b.downVote.length;
                return scoreB - scoreA;
            }
        })
        : [];

    const checkAuthAndNavigateToCreatePost = () => {
        if (!user) {
            alert("Login or signup to create a post");
            navigate("/Auth");
        } else {
            navigate(`/CreatePost/${CATEGORY_NAME.toLowerCase()}`);
        }
    };

    const handleTogglePin = (id) => {
        dispatch(togglePinPost(id));
    };

    const [globalMessages, setGlobalMessages] = useState([]);
    const [globalChatInput, setGlobalChatInput] = useState("");
    const globalMessagesEndRef = useRef(null);

    const sendGlobalMessage = () => {
        if (!user) {
            alert("Please log in to send messages in global chat.");
            return;
        }
        if (globalChatInput.trim() === "") return;

        const messageText = globalChatInput.trim();
        const senderId = user?.result?._id;
        const senderName = user?.result?.name || "Anonymous";

        socket.current.emit("global message", {
            userId: senderId,
            userName: senderName,
            text: messageText,
        });

        setGlobalChatInput("");
    };

    useEffect(() => {
        socket.current = io(process.env.REACT_APP_BASE_URL);
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/globalchat/history`)
            .then(response => {
                const formattedMessages = response.data.map(msg => ({
                    id: msg._id,
                    senderName: msg.senderName,
                    text: msg.text,
                    timestamp: new Date(msg.timestamp)
                }));
                setGlobalMessages(formattedMessages);
            })
            .catch(error => {
                console.error("Error fetching global chat history:", error);
            });

        socket.current.on("global message", (msg) => {
            setGlobalMessages((prev) => {
                const isDuplicate = prev.some(m => m.id === msg._id);
                if (isDuplicate) {
                    return prev;
                }
                const senderDisplay = user?.result?._id === msg.userId ? "You" : msg.userName || msg.senderName; 

                return [
                    ...prev,
                    {
                        id: msg._id,
                        senderName: senderDisplay,
                        text: msg.text,
                        timestamp: new Date(msg.timestamp)
                    }
                ];
            });
        });

        return () => {
            socket.current.disconnect();
        };
    }, [user?.result?._id]);

    useEffect(() => {
        globalMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [globalMessages]);

    return (
        <div className="home-container-1">
            <div className="main-content">
                <div className="main-bar">
                    <div className="main-bar-header">
                        <div className="filter-bar">
                            <div
                                className={`filter-item ${currentFilter === 'hot' ? 'active-filter' : ''}`}
                                onClick={() => setCurrentFilter('hot')}
                            >
                                <FaFire className="filter-icon" /><span>Hot</span>
                            </div>
                            <div
                                className={`filter-item ${currentFilter === 'new' ? 'active-filter' : ''}`}
                                onClick={() => setCurrentFilter('new')}
                            >
                                <FaClock className="filter-icon" /><span>New</span>
                            </div>
                        </div>
                        <button onClick={checkAuthAndNavigateToCreatePost} className="create-btn">Create Post</button>
                    </div>

                    <div>
                        {postsList.data === null ? (
                            <h1>Loading posts...</h1>
                        ) : (
                            <>
                                <p className="post-count">{sortedAndFilteredPosts.length} Posts</p>
                                {sortedAndFilteredPosts.length > 0 ? (
                                    sortedAndFilteredPosts.map((post) => (
                                        <div key={post._id} className="display-post-container">
                                            <div className="votes-section">
                                                <FaAngleUp className="vote-icon" />
                                                <p className="vote-count">
                                                    {post.upVote.length - post.downVote.length}
                                                </p>
                                            </div>
                                            {isAdmin && (
                                                <div className="admin-actions">
                                                    <input
                                                        type="number"
                                                        value={boostAmount}
                                                        onChange={(e) => setBoostAmount(Number(e.target.value))}
                                                        className="border px-2 py-1 mr-2 rounded"
                                                        placeholder="Boost amount"
                                                    />
                                                    <button
                                                        onClick={() => dispatch(boostUpvotes(post._id, boostAmount))}
                                                        className="bg-green-500 text-white px-4 py-1 rounded boost-btn"
                                                    >
                                                        Boost Upvotes
                                                    </button>
                                                    <button
                                                        onClick={() => handleTogglePin(post._id)}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded pin-btn ml-2"
                                                    >
                                                        {post.pinned ? 'Unpin' : 'Pin'}
                                                    </button>
                                                </div>
                                            )}

                                            <div className="display-post-details">
                                                <div className="post-time-top-right">
                                                    {moment(post.postedOn).fromNow()}
                                                    {post.pinned && <span className="pinned-label">🔥 Boosted</span>}
                                                </div>
                                                <Link to={`/Posts/${post._id}`} className="post-title-link">
                                                    <h3>
                                                        {post.postTitle.length > 50
                                                            ? post.postTitle.substring(0, 50) + "..."
                                                            : post.postTitle}
                                                    </h3>
                                                </Link>
                                                <p className="post-description">
                                                    {post.postBody ? post.postBody.substring(0, 100) + "..." : ""}
                                                </p>
                                                {post.mediaUrls && post.mediaUrls.length > 0 && (
                                                    <div className="post-media-preview">
                                                        {post.mediaUrls[0].includes('.mp4') || post.mediaUrls[0].includes('.webm') ? (
                                                            <video src={post.mediaUrls[0]} controls className="media-thumbnail" />
                                                        ) : (
                                                            <img src={post.mediaUrls[0]} alt="Post media" className="media-thumbnail" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="display-tags-time">
                                                    <div className="display-tags">
                                                        {post.postTags && post.postTags.map((tag) => (
                                                            <p key={tag}>
                                                                {tag.length > 20 ? `${tag.substring(0, 20)}...` : tag}
                                                            </p>
                                                        ))}
                                                    </div>
                                                    <div className="comments-section">
                                                        <BiCommentDots className="comment-icon" />
                                                        <p className="comment-count">{post.noOfComments}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-posts-message">No posts in the {CATEGORY_NAME} category yet. Be the first to post!</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="global-chat">
                    <h3>Global Chat</h3>
                    <CryptoTicker />
                    <div className="chat-messages">
                        {globalMessages.map((msg) => (
                            <div key={msg.id} className={`chat-message ${user?.result?._id === msg.userId ? "own" : ""}`}>
                                <span className="chat-user">{msg.senderName}:</span> {msg.text}
                            </div>
                        ))}
                        <div ref={globalMessagesEndRef} />
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={globalChatInput}
                            onChange={(e) => setGlobalChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendGlobalMessage()}
                        />
                        <button onClick={sendGlobalMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default News;