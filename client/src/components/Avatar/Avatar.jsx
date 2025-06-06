import React from 'react';

const Avatar = ({ children, backgroundColor, px, py, color, borderRadius, fontSize, cursor, src }) => {





    const avatarSize = '40px'; 

    const style = {
        backgroundColor,



        width: avatarSize,
        height: avatarSize,
        color: color || 'white',
        borderRadius: '50%', 
        fontSize,
        textAlign: "center",
        cursor: cursor || null,
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: 'hidden', 
    };




    return (
        <div style={style}>
            {src ? (
                <img
                    src={src}
                    alt="Profile Avatar"
                    style={{
                        width: '100%',     
                        height: '100%',    
                        objectFit: 'cover', 
                        borderRadius: '50%', 
                    }}
                />
            ) : (

                <span style={{ padding: `${py} ${px}` }}>
                    {children}
                </span>
            )}
        </div>
    );
};

export default Avatar;