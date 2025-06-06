import React, { useEffect } from 'react'; 
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Avatar from '../../components/Avatar/Avatar';
import { deleteComment } from '../../actions/post';


const DisplayComment = ({ post, handleShare }) => {
    const User = useSelector((state) => state.currentUserReducer);
    const { id } = useParams(); 
    const dispatch = useDispatch();


    useEffect(() => {
        console.log("[DisplayComment] Component mounted/updated.");
        console.log("[DisplayComment] 'post' prop received:", post);
        console.log("[DisplayComment] Current User (from Redux):", User);
        console.log("[DisplayComment] Post ID from URL (useParams):", id);

        if (!post) {
            console.error("[DisplayComment] 'post' prop is undefined or null!");
        } else if (!post.comment) {
            console.warn("[DisplayComment] 'post.comment' is undefined. Ensure your post object has a 'comment' array.");

            console.log("[DisplayComment] post.comments (if exists):", post.comments);
            console.log("[DisplayComment] post.answer (if exists):", post.answer);
        } else {
            console.log("[DisplayComment] Comments array (post.comment):", post.comment);


            post.comment.forEach((com, idx) => {
                console.log(`[DisplayComment] Comment object at index ${idx}:`, com);
                if (!com._id) {
                    console.warn(`[DisplayComment] Comment at index ${idx} is missing _id. Using index as key fallback.`);
                }
            });
        }
    }, [post, User, id]); 


    const handleDelete = (commentId, noOfComments) => {
        console.log("[DisplayComment] handleDelete called for commentId:", commentId, "on post ID:", id);
        console.log("[DisplayComment] noOfComments (before decrement):", noOfComments);

        if (window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {

            dispatch(deleteComment(id, commentId, noOfComments - 1));
            console.log("[DisplayComment] deleteComment action dispatched.");
        } else {
            console.log("[DisplayComment] Delete action cancelled.");
        }
    };



    if (!post || !post.comment) {
        console.log("[DisplayComment] Not rendering comments as 'post' or 'post.comment' is missing/invalid.");
        return null; 
    }

    return (
        <div className="comment-list"> {}
            {post.comment.map((com, index) => (
                <div className="comment-item" key={com._id || index} style={{ animationDelay: `${0.3 + index * 0.05}s` }}> {}
                    {}
                    <div className="comment-header">
                        <Link to={`/Users/${com.userId}`} className='comment-author-link'>
                            <Avatar backgroundColor="#00BFFF" px='8px' py='5px' color="#000000">
                                {com.userCommented.charAt(0).toUpperCase()}
                            </Avatar>
                            <span>{com.userCommented}</span>
                        </Link>
                        <span className="comment-timestamp">
                            Commented {moment(com.commentedOn).fromNow()}
                        </span>
                    </div>

                    <p className="comment-body">{com.commentBody}</p>

                    <div className="comment-actions">
                        <button type="button" onClick={handleShare} className="comment-action-btn share-btn">
                            Share
                        </button>
                        {User?.result?._id === com?.userId && (
                            <button
                                type='button'
                                onClick={() => handleDelete(com._id, post.noOfComments)}
                                className="comment-action-btn delete-btn comment-delete-btn"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DisplayComment;