import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './GroupDock.css'; 






const GroupDock = ({ onSelectUser = () => {}, currentUserId, socket }) => {
    const [groups, setGroups] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [onlineUserIds, setOnlineUserIds] = useState([]); 
    const scrollContainerRef = useRef(null);

    useEffect(() => {

        if (!socket) {
            console.warn("[GroupDock] Socket instance not provided.");
            return;
        }



        if (currentUserId && socket.connected) {
            console.log(`[GroupDock] Emitting 'join' for userId: ${currentUserId}`);
            socket.emit('join', currentUserId);
        }


        const handleReconnect = () => {
            if (currentUserId) {
                console.log(`[GroupDock] Socket reconnected, re-emitting 'join' for userId: ${currentUserId}`);
                socket.emit('join', currentUserId);
            }
        };
        socket.on('reconnect', handleReconnect);
        socket.on('connect', handleReconnect); 


        socket.on('onlineUsers', (users) => {
            setOnlineUserIds(users);
            console.log('[GroupDock] Online users updated:', users); 
        });


        return () => {

            if (socket) {
                socket.off('onlineUsers');
                socket.off('reconnect');
                socket.off('connect');
            }
        };
    }, [currentUserId, socket]); 

    useEffect(() => {
        const fetchUsers = async () => {
            try {

                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/all`);
                const users = response.data.map((user) => ({
                    id: user._id, 
                    name: user.name, 
                    logo: `https://placehold.co/60x60?text=${encodeURIComponent(
                        user.name.charAt(0).toUpperCase() 
                    )}`,
                }));
                setGroups(users);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []); 


    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        const onWheel = (e) => {
            if (scrollContainer) {
                e.preventDefault();
                scrollContainer.scrollLeft += e.deltaY;
            }
        };
        if (scrollContainer) {
            scrollContainer.addEventListener('wheel', onWheel, { passive: false });
        }
        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('wheel', onWheel);
            }
        };
    }, []);


    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && searchOpen) {
                setSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [searchOpen]);


    const filteredGroups = groups.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('search-overlay')) {
            setSearchOpen(false);
        }
    };

    return (
        <>
            {}
            <div
                className={`search-overlay ${searchOpen ? 'active' : ''}`}
                onClick={handleOverlayClick}
            />

            {}
            {searchOpen && (
                <div className="search-modal" role="dialog" aria-modal="true">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        autoFocus 
                    />
                    <div className="search-results">
                        {filteredGroups.length === 0 && (
                            <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                                No users found.
                            </div>
                        )}
                        {filteredGroups.map((group) => (
                            <div
                                key={group.id}
                                className="search-result-item"
                                onClick={() => {
                                    setSearchOpen(false); 

                                    onSelectUser({ id: group.id, name: group.name });
                                }}
                            >
                                <img src={group.logo} alt={group.name} />
                                <span>{group.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {}
            <div className="group-dock-container">
                <div className="group-dock-scroll" ref={scrollContainerRef}>
                    {}
                    <div
                        className="group-icon"
                        onClick={() => setSearchOpen((prev) => !prev)}
                        data-tooltip-id="tooltip-search"
                        data-tooltip-content="Search Users"
                        style={{ backgroundColor: '#0ea5e9', fontSize: '1.25rem' }}
                    >
                        🔍
                        <Tooltip id="tooltip-search" place="top" />
                    </div>

                    {}
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="group-icon"
                            onClick={() => onSelectUser({ id: group.id, name: group.name })} 
                            data-tooltip-id={`tooltip-${group.id}`}
                            data-tooltip-content={group.name}
                        >
                            <img src={group.logo} alt={group.name} className="group-img" />
                            {}
                            {onlineUserIds.includes(group.id) && (
                                <div className="online-indicator" title="Online"></div>
                            )}
                            <Tooltip id={`tooltip-${group.id}`} place="top" />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default GroupDock;