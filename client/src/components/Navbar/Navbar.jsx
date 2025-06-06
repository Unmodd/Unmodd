import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import decode from 'jwt-decode';
import moment from 'moment';

import logo from '../../assets/logo.png';
import Avatar from '../../components/Avatar/Avatar';
import '../../index.css';
import '../Navbar/Navbar.css';
import { setCurrentUser } from '../../actions/currentUser';
import * as api from '../../api'; 

const Navbar = () => {
    const dispatch = useDispatch();
    const User = useSelector((state) => state.currentUserReducer);
    const navigate = useNavigate();

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]); 
    const [unreadCount, setUnreadCount] = useState(0); 
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationError, setNotificationError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const debounceTimeoutRef = useRef(null);

    const profileDropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const suggestionsRef = useRef(null);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/');
        dispatch(setCurrentUser(null));
        setIsProfileDropdownOpen(false);
    };


    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setIsNotificationDropdownOpen(false);
            }
            if (searchInputRef.current && !searchInputRef.current.contains(event.target) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    useEffect(() => {
        const token = User?.token;
        if (token) {
            const decodedToken = decode(token);
            if (decodedToken.exp * 1000 < new Date().getTime()) {
                handleLogout();
            }
        }

        if (!User?.result && localStorage.getItem('Profile')) {
            dispatch(setCurrentUser(JSON.parse(localStorage.getItem('Profile'))));
        }
    }, [User?.token, User?.result, dispatch]); 


    const fetchUnreadNotificationCount = useCallback(async () => {
        if (!User?.result?._id) {
            setUnreadCount(0);
            return;
        }
        try {

            const { data } = await api.getUnreadNotificationCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread notification count:', error);
            setUnreadCount(0); 
        }
    }, [User?.result?._id]);


    const fetchAllNotifications = useCallback(async () => {
        if (!User?.result?._id) {
            setNotifications([]);
            return;
        }
        setNotificationLoading(true);
        setNotificationError(null);
        try {


            const { data } = await api.fetchNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching all notifications:', error);
            setNotificationError('Failed to load notifications.');
            setNotifications([]);
        } finally {
            setNotificationLoading(false);
        }
    }, [User?.result?._id]);


    useEffect(() => {
        if (User?.result?._id) {
            fetchUnreadNotificationCount(); 

            const countInterval = setInterval(() => {
                fetchUnreadNotificationCount(); 
            }, 15000); 

            return () => {
                clearInterval(countInterval); 
            };
        }
    }, [User?.result?._id, fetchUnreadNotificationCount]);


    const handleNotificationIconClick = () => {
        setIsNotificationDropdownOpen(prevState => {
            if (!prevState) { 
                fetchAllNotifications(); 
            }
            return !prevState;
        });
    };

    const handleNotificationClick = async (notificationId, relatedEntityId, relatedEntityType) => {

    setNotifications(prevNotifications =>
        prevNotifications.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );

    setUnreadCount(prevCount => {
        const notificationToMark = notifications.find(n => n._id === notificationId);
        return notificationToMark && !notificationToMark.read ? Math.max(0, prevCount - 1) : prevCount;
    });


    try {
        await api.markNotificationsAsRead([notificationId]);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        fetchAllNotifications();
        fetchUnreadNotificationCount();
    }


    if (relatedEntityType === 'Post' && relatedEntityId) {

        const postIdToNavigate = relatedEntityId._id || relatedEntityId; 
        navigate(`/Posts/${postIdToNavigate}`);
    } else if (relatedEntityType === 'User' && relatedEntityId) {

        navigate(`/Users/${relatedEntityId}`);
    }


    setIsNotificationDropdownOpen(false); 
    };



    const fetchSuggestions = useCallback(async (query) => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            setSuggestionsLoading(false);
            return;
        }

        setSuggestionsLoading(true);
        try {

            const { data } = await api.fetchPostSuggestions(query.trim());
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
        } catch (error) {
            console.error("Error fetching post suggestions:", error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setSuggestionsLoading(false);
        }
    }, []);


    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };


    const handleSearchSubmit = (e) => {
        e.preventDefault();

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (searchQuery.trim()) {
            navigate(`/posts/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSuggestions([]);
            setShowSuggestions(false);
        } else {
            navigate('/posts');
        }
        setIsProfileDropdownOpen(false);
        setIsNotificationDropdownOpen(false);
    };


    const handleSuggestionClick = (postId) => {
        navigate(`/posts/${postId}`);
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <nav className='main-nav'>
            <div className='navbar'>
                <div className="nav-left">
                    <NavLink to='/' className='nav-item nav-logo'>
                        <img src={logo} alt='logo' width="240" height="50" />
                    </NavLink>
                    {}
                    <div className="search-container">
                        <form onSubmit={handleSearchSubmit} className="search-form">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder='Search posts by title...'
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                onFocus={() => searchQuery.trim().length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
                                className="search-input"
                            />
                        </form>
                        {showSuggestions && (
                            <div className="search-suggestions" ref={suggestionsRef}>
                                {suggestionsLoading && <div className="suggestion-item loading">Loading suggestions...</div>}
                                {!suggestionsLoading && suggestions.length === 0 && searchQuery.trim().length > 1 ? (
                                    <div className="suggestion-item no-results">No suggestions found.</div>
                                ) : (
                                    !suggestionsLoading && suggestions.map(post => (
                                        <div
                                            key={post._id}
                                            className="suggestion-item"
                                            onClick={() => handleSuggestionClick(post._id)}
                                        >
                                            {post.postTitle}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="nav-zones">
                    <NavLink to='/cryptocurrency' className={({ isActive }) => isActive ? 'nav-item nav-btn active' : 'nav-item nav-btn'}>Cryptocurrency</NavLink>
                    <NavLink to='/memes' className={({ isActive }) => isActive ? 'nav-item nav-btn active' : 'nav-item nav-btn'}>Memes</NavLink>
                    <NavLink to='/news' className={({ isActive }) => isActive ? 'nav-item nav-btn active' : 'nav-item nav-btn'}>News</NavLink>
                </div>

                <div className="nav-right">
                    {User === null ? (
                        <NavLink to='/Auth' className='nav-item nav-links'>Log in</NavLink>
                    ) : (
                        <>
                            {}
                            <div className="notification-container" ref={notificationDropdownRef}>
                                <button className="notification-button" onClick={handleNotificationIconClick}>
                                    <span className="notification-icon">🔔</span>
                                    {unreadCount > 0 && ( 
                                        <span className="notification-badge">{unreadCount}</span>
                                    )}
                                </button>
                                {isNotificationDropdownOpen && (
                                    <div className="dropdown-menu notification-menu">
                                        {notificationLoading && <div className="dropdown-item loading">Loading notifications...</div>}
                                        {notificationError && <div className="dropdown-item error">{notificationError}</div>}
                                        {!notificationLoading && !notificationError && notifications.length === 0 ? (
                                            <div className="dropdown-item">No new notifications.</div>
                                        ) : (
                                            !notificationLoading && !notificationError && notifications.map(notification => (
                                            <div
                                                key={notification._id}
                                                className={`dropdown-item notification-item ${!notification.read ? 'unread' : ''}`}
                                                onClick={() => handleNotificationClick(
                                                    notification._id,


                                                    notification.type === 'mention' || notification.type === 'new_post' || notification.type === 'reply' || notification.type === 'post_vote'
                                                        ? notification.postId
                                                        : notification.relatedEntityId,

                                                    notification.type === 'mention' || notification.type === 'new_post' || notification.type === 'reply' || notification.type === 'post_vote'
                                                        ? 'Post'
                                                        : notification.relatedEntityType
                                                )}
                                            >
                                                {notification.message}
                                                {notification.sender?.username && ` from ${notification.sender.username}`}
                                                {notification.postId?.postTitle && ` on "${notification.postId.postTitle}"`} {}
                                                {notification.createdAt && (
                                                    <span className="notification-time"> - {moment(notification.createdAt).fromNow()}</span>
                                                )}
                                            </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {}
                            <div className="profile-dropdown" ref={profileDropdownRef}>
                                <div className="profile-avatar-container" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
                                    <Avatar
                                        backgroundColor='#00BFFF'
                                        px="15px"
                                        py="10px"
                                        borderRadius="50%"
                                        color='black'
                                        src={User.result.profilePicture}
                                    >
                                        <NavLink to={`/Users/${User?.result?._id}`} style={{ color: "black", textDecoration: 'none' }}>
                                            {User.result.profilePicture ? '' : User.result.name.charAt(0).toUpperCase()}
                                        </NavLink>
                                    </Avatar>
                                    <span className="dropdown-arrow"></span>
                                </div>
                                {isProfileDropdownOpen && (
                                    <div className="dropdown-menu profile-menu">
                                        <NavLink to={`/Users/${User?.result?._id}`} className="dropdown-item" onClick={() => setIsProfileDropdownOpen(false)}>
                                            Profile
                                        </NavLink>
                                        <button className='dropdown-item logout-btn' onClick={handleLogout}>
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;