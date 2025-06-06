
import React from 'react';
import { Link } from 'react-router-dom'; 

const RenderContentWithMentions = ({ content }) => {

    const parts = content.split(/(@[a-zA-Z0-9_]+)/g);

    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('@')) {
                    const username = part.substring(1);

                    return (
                        <Link key={index} to={`/users/profile/${username}`} className="mention-link">
                            {part}
                        </Link>
                    );
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </>
    );
};

export default RenderContentWithMentions;