import React, { createContext, useState, useContext } from 'react';


export const PostContext = createContext();


export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([

    { id: 'p1', title: 'Bitcoin surges after halving event', content: 'The price of Bitcoin has seen a significant increase...', category: 'Cryptocurrency' },
    { id: 'p2', title: 'Viral Doge Meme Resurfaces', content: 'The classic Doge meme has gained renewed popularity on social media...', category: 'Memes' },
    { id: 'p3', title: 'Global Stock Markets React to Inflation Data', content: 'Analysts are closely watching new inflation figures...', category: 'News' },
    { id: 'p4', title: 'Ethereum Breaks New All-Time Highs', content: 'Exciting times for Ethereum holders as the network scales up...', category: 'Cryptocurrency' },
    { id: 'p5', title: 'Hilarious Spongebob Meme Explained', content: 'A deep dive into the cultural impact of this iconic cartoon meme...', category: 'Memes' },
  ]);

  const addPost = (newPost) => {
    setPosts((prevPosts) => [...prevPosts, newPost]);
  };

  return (
    <PostContext.Provider value={{ posts, addPost }}>
      {children}
    </PostContext.Provider>
  );
};


export const usePosts = () => {
  return useContext(PostContext);
};