
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as api from '../../api';
import './MentionInput.css';

const MentionInput = forwardRef(({ value, onChange, placeholder, rows = 1 }, ref) => {
    const [text, setText] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [usernameToIdMap, setUsernameToIdMap] = useState({});
    const textareaRef = useRef(null);
    const debounceTimeoutRef = useRef(null);
    const suggestionContainerRef = useRef(null);

    useEffect(() => {
        setText(value);
    }, [value]);

    const fetchUserSuggestions = useCallback(async (query) => {
        if (query.length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            setLoadingSuggestions(false);
            return;
        }
        setLoadingSuggestions(true);
        try {
            const { data } = await api.searchUsers(query);
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
            const newMap = {};
            data.forEach(user => (newMap[user.username] = user._id));
            setUsernameToIdMap(prevMap => ({ ...prevMap, ...newMap }));
        } catch (error) {
            console.error("Error fetching user suggestions:", error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setLoadingSuggestions(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        onChange(newText);

        const lastWord = newText.split(/\s+/).pop();
        if (lastWord.startsWith('@') && lastWord.length > 1) {
            const usernameQuery = lastWord.substring(1);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
                fetchUserSuggestions(usernameQuery);
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (username) => {
        const words = text.split(/\s+/);
        words[words.length - 1] = `@${username}`;
        const newText = words.join(' ') + ' ';
        setText(newText);
        onChange(newText);
        setSuggestions([]);
        setShowSuggestions(false);
        textareaRef.current.focus();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (textareaRef.current && !textareaRef.current.contains(event.target) &&
                suggestionContainerRef.current && !suggestionContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    useImperativeHandle(ref, () => ({
        getMentionedUserIds: () => {
            const mentionedUsernames = text.match(/@([a-zA-Z0-9_]+)/g) || [];
            const uniqueMentionedIds = new Set();
            mentionedUsernames.forEach(mention => {
                const username = mention.substring(1);
                if (usernameToIdMap[username]) {
                    uniqueMentionedIds.add(usernameToIdMap[username]);
                }
            });
            return Array.from(uniqueMentionedIds);
        }
    }));

    return (
        <div className="mention-input-container">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInputChange}
                placeholder={placeholder}
                rows={rows}
                className="mention-textarea"
            ></textarea>
            {showSuggestions && (
                <div className="suggestions-dropdown" ref={suggestionContainerRef}>
                    {loadingSuggestions && <div className="suggestion-item">Loading users...</div>}
                    {!loadingSuggestions && suggestions.length === 0 && text.endsWith('@') && (
                        <div className="suggestion-item no-results">No users found.</div>
                    )}
                    {!loadingSuggestions && suggestions.map(user => (
                        <div
                            key={user._id}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(user.username)}
                        >
                            <img src={user.profilePicture || 'https://i.stack.imgur.com/g02hS.png'} alt="profile" className="suggestion-avatar" />
                            {user.username}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default MentionInput;