
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import GroupDock from '../../components/GroupDock';
import ChatWindow from '../../components/Chat/ChatWindow';
import '../../components/Chat/Chat.css';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      <div className="p-6">
        <h1 className="text-3xl font-bold">Chat App</h1>
        <p className="text-zinc-400">Select a user to start chatting.</p>
      </div>
    </div>
  );
};

export default ChatPage;

