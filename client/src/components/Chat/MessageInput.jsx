import React from 'react';

const MessageInput = ({ value, onChange, onSend }) => {
  return (
    <div className="flex items-center p-4 border-t border-white/20 bg-white/5 backdrop-blur">
      <input
        className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        placeholder="Type your message..."
        value={value}
        onChange={onChange}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
      />
      <button
        onClick={onSend}
        className="ml-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
