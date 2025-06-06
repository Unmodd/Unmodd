import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CreatePost.css';
import { createPost } from '../../actions/post'; 


import { MentionsInput, Mention } from 'react-mentions';
import defaultStyle from './defaultStyle'; 
import mentionStyle from './mentionStyle'; 




const fetchUsers = async (query) => {
    if (!query) return [];
    try {


        const response = await axios.get(`/api/users?search=${query}`);

        return response.data.map(user => ({
            id: user._id,       
            display: user.name, 
            username: user.name 
        }));
    } catch (error) {
        console.error('Failed to fetch user suggestions:', error);
        return [];
    }
};



const CreatePost = () => {
    const { categoryName } = useParams();

    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState(''); 
    const [postTags, setPostTags] = useState('');
    const [media, setMedia] = useState([]);
    const [category, setCategory] = useState('');


    const [suggestions, setSuggestions] = useState([]);

    const dispatch = useDispatch();
    const User = useSelector((state) => state.currentUserReducer);
    const navigate = useNavigate();

    useEffect(() => {
        if (categoryName) {
            const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
            setCategory(formattedCategory);
        } else {
            alert("Category not specified. Please try creating a post from a category page.");
            navigate('/');
        }
    }, [categoryName, navigate]);


    const onMentionsAdd = useCallback(async (query, callback) => {
        const userSuggestions = await fetchUsers(query);
        setSuggestions(userSuggestions); 
        callback(userSuggestions); 
    }, []);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        const uploadedMedia = [];

        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await axios.post('/api/upload/file', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploadedMedia.push({ url: res.data.url, type: file.type });
            } catch (err) {
                console.error(`Upload failed for ${file.name}:`, err);
                alert(`Failed to upload ${file.name}. See console for details.`);
            }
        }
        setMedia((prev) => [...prev, ...uploadedMedia]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!User) return alert('Login to create a post');
        if (!postTitle || !postBody || !postTags.trim() || !category) {
            return alert('Please enter all the fields and ensure a category is set.');
        }




        const postData = {
            postTitle,
            postBody,
            postTags: postTags.trim().split(/\s+/).filter(tag => tag.length > 0).map(tag => tag.toLowerCase()),
            mediaUrls: media.map((item) => item.url),
            userPosted: User.result.name,
            userId: User.result._id,
            category,
        };

        dispatch(createPost(postData, navigate));
    };

    const renderMedia = (item, idx) => {
        if (item.type.includes('video')) {
            return (
                <video key={idx} controls className="media-item">
                    <source src={item.url} type={item.type} />
                    Your browser does not support the video tag.
                </video>
            );
        } else if (item.type.includes('audio')) {
            return (
                <audio key={idx} controls className="media-item">
                    <source src={item.url} type={item.type} />
                    Your browser does not support the audio tag.
                </audio>
            );
        } else if (item.type.includes('image') || item.type.includes('gif')) {
            return (
                <img
                    key={idx}
                    src={item.url}
                    alt={`uploaded-media-${idx}`}
                    className="media-item"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200x150?text=Error+Loading+Media';
                    }}
                />
            );
        }
        return null;
    };

    return (
        <div className="create-post-page">
            <div className="create-post-container">
                <h1 className="create-post-title">Create a Post for <span className="category-highlight">{category || '...'}</span></h1>
                <form onSubmit={handleSubmit} className="create-post-form">
                    <div className="form-group">
                        <label htmlFor="postTitle">
                            <h4>Title <span className="required-star">*</span></h4>
                            <input
                                id="postTitle"
                                type="text"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                placeholder="A catchy title for your post (e.g., 'My Experience with Blockchain Gaming')"
                                required
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="postBody">
                            <h4>Description <span className="required-star">*</span></h4>
                            <MentionsInput
                                value={postBody}
                                onChange={(e) => setPostBody(e.target.value)}
                                style={defaultStyle} 
                                placeholder="Share your thoughts, insights, or story here. Type @ to mention a user!"
                                className="mentions-input" 
                            >
                                <Mention
                                    trigger="@"
                                    data={onMentionsAdd} 
                                    style={mentionStyle} 
                                    displayTransform={(id, display) => `@${display}`} 
                                    appendSpaceOnAdd={true} 
                                />
                            </MentionsInput>
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="postTags">
                            <h4>Tags <small>(e.g., blockchain web3 crypto)</small><span className="required-star">*</span></h4>
                            <input
                                id="postTags"
                                type="text"
                                value={postTags}
                                onChange={(e) => setPostTags(e.target.value)}
                                placeholder="Separate tags with spaces (e.g., decentralized finance NFTs)"
                                required
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">
                            <h4>Category</h4>
                            <input
                                id="category"
                                type="text"
                                value={category}
                                readOnly
                                className="read-only-input"
                                disabled
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="mediaUpload">
                            <h4>Add Media (Image / Video / Audio / GIF)</h4>
                            <input
                                id="mediaUpload"
                                type="file"
                                multiple
                                accept="image/*,video/*,audio/*,.gif"
                                onChange={handleFileUpload}
                                className="file-input"
                            />
                            {media.length > 0 && (
                                <div className="media-preview">
                                    {media.map((item, idx) => renderMedia(item, idx))}
                                </div>
                            )}
                        </label>
                    </div>

                    <button type="submit" className="submit-post-btn">
                        Create Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;