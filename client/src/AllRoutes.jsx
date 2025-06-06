

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';


import Home from './Pages/Home/Home';
import Auth from './Pages/Auth/Auth';
import DisplayPost from './Pages/Posts/DisplayPost';
import Tags from './Pages/Tags/Tags';
import Users from './Pages/Users/Users';
import UserProfile from './Pages/UserProfile/UserProfile';


import CreatePost from './Pages/CreatePost/CreatePost'; 


import Memes from './Pages/Memes/Memes'; 
import Cryptocurrency from './Pages/Cryptocurrency/Cryptocurrency'; 
import News from './Pages/News/News'; 


import CryptoPage from './Pages/Crypto/CryptoPage';
import ChatPage from './Pages/Chat/ChatPage';
import Posts from './Pages/Posts/Posts';


const AllRoutes = () => {
    const currentUser = useSelector((state) => state.currentUserReducer);

    return (
        <Routes>
            <Route path='/' element={<Memes />} />
            <Route path='/Auth' element={<Auth />} />
            <Route path="/CreatePost/:categoryName" element={<CreatePost />} />
            <Route path='/Posts/:id' element={<DisplayPost />} />
            <Route path='/Posts' element={<Posts />} />
            <Route path='/Tags' element={<Tags />} />
            <Route path='/Users' element={<Users />} />
            <Route path='/Users/:id' element={<UserProfile />} />

            {}
            <Route path="/memes" element={<Memes />} />
            <Route path="/cryptocurrency" element={<Cryptocurrency />} />
            <Route path="/news" element={<News />} />

            <Route path="/crypto" element={<CryptoPage />} />
            <Route path="/messages" element={<ChatPage currentUserId={currentUser?.result?._id} />} />
            <Route path="/chat" element={<ChatPage />} />
        </Routes>
    );
};

export default AllRoutes;