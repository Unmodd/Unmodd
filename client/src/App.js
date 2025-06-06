

import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';

import './App.css';
import Navbar from './components/Navbar/Navbar';
import AllRoutes from './AllRoutes';
import { fetchAllPosts } from './actions/post';
import { fetchAllUsers } from './actions/users';
import GroupDock from './components/GroupDock';
import ChatWindow from './components/Chat/ChatWindow';
import UserDock from "./components/UserDock/UserDock";
import 'react-tooltip/dist/react-tooltip.css';


const appSocket = io('http://localhost:5000');

function App() {
    const dispatch = useDispatch();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

    const currentAuthData = useSelector((state) => state.currentUser); 
    const currentUser = currentAuthData?.result; 
    const currentUserId = currentUser?._id;




    useEffect(() => {
        const profile = localStorage.getItem('profile');
        if (profile) {
            try {
                const parsedProfile = JSON.parse(profile);


                dispatch({ type: 'AUTH', payload: parsedProfile });
                console.log("[App.js Init] Loaded user from localStorage and dispatched AUTH:", parsedProfile);
            } catch (e) {
                console.error("[App.js Init] Failed to parse profile from localStorage:", e);
                localStorage.removeItem('profile'); 
            }
        }


        dispatch(fetchAllPosts());
        dispatch(fetchAllUsers());
    }, [dispatch]); 


    useEffect(() => {
        console.log("[App.js] Current User state (from current user logger):", currentUser);
        if (currentUser) {
            console.log("[App.js] Current User ID (from current user logger):", currentUser._id);
        } else {
            console.log("[App.js] Current User is not yet available (null/undefined) from current user logger.");
        }
    }, [currentUser]); 



    useEffect(() => {
        if (currentUserId) {
            console.log(`[App.js] User ${currentUserId} attempting to join socket room.`);

            if (!appSocket.connected) {
                 console.log("[App.js] Reconnecting appSocket.");
                 appSocket.connect();
            }
            appSocket.emit('join', currentUserId);









        } else { 
            if (appSocket.connected) {
                console.log("[App.js] User logged out or no user yet. Disconnecting socket.");
                appSocket.disconnect();
            }
        }


        return () => {



            if (appSocket.connected) { 
                console.log("[App.js] Cleaning up global socket connection.");
                appSocket.disconnect();
            }
        };
    }, [currentUserId]); 


    const handleSelectUser = (user) => {
        console.log("[App.js] User selected for chat:", user);
        setSelectedUser(user);
        setIsChatWindowOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatWindowOpen(false);
        setSelectedUser(null);
        console.log("[App.js] Chat window closed.");
    };


    return (
        <div className="App">
            <Router>
                <Navbar />
                <AllRoutes currentUser={currentUser} selectedUser={selectedUser} onSelectUser={handleSelectUser} />
                {currentUserId && <UserDock currentUserId={currentUserId} />}
            </Router>

            {}
            {}
            {currentUserId && (
                <GroupDock
                    onSelectUser={handleSelectUser}
                    currentUserId={currentUserId}
                    socket={appSocket}
                />
            )}

            {}
            {}
            {selectedUser && currentUserId && isChatWindowOpen && (
                <ChatWindow
                    user={selectedUser}
                    onClose={handleCloseChat}
                    currentUserId={currentUserId}
                    socket={appSocket}
                />
            )}
        </div>
    );
}

export default App;