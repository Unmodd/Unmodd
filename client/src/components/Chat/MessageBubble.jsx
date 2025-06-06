import React from 'react';
import clsx from 'clsx';

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div
      className={clsx(
        'max-w-xs p-3 rounded-2xl shadow-md text-sm relative',
        isOwn
          ? 'ml-auto bg-blue-500/30 text-white animate-fade-in-right'
          : 'mr-auto bg-white/20 text-white animate-fade-in-left'
      )}
    >
      <div>{message.content}</div>
      <div className="absolute text-[0.65rem] text-white/60 bottom-[-14px] right-2">
        {new Date(message.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MessageBubble;
