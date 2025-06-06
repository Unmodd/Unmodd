import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Chat.css'; 





const ChatWindow = ({ user, onClose, currentUserId, socket }) => {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [visible, setVisible] = useState(false);


    const inputRef = useRef(null);

    const messagesEndRef = useRef(null);






    const handleSend = useCallback(() => {
        if (!input.trim()) return; 


        const messageToSend = {
            senderId: currentUserId, 
            receiverId: user.id,     
            message: input.trim(),   
            timestamp: new Date().toISOString(), 
        };

        console.log("[ChatWindow] Sending private message:", messageToSend);


        if (socket && socket.connected) {
            socket.emit('private_message', messageToSend);
        } else {
            console.warn("[ChatWindow] Socket not connected, message not sent:", messageToSend);

        }



        setMessages((prevMessages) => [
            ...prevMessages,
            {
                text: input.trim(),
                sender: 'me', 
                timestamp: new Date().toLocaleTimeString(), 
            },
        ]);

        setInput(''); 
        inputRef.current?.focus(); 
    }, [input, currentUserId, user.id, socket]); 






    const handleClose = useCallback(() => {
        setVisible(false); 

        setTimeout(() => onClose(), 250);
    }, [onClose]); 



    useEffect(() => {


        setTimeout(() => setVisible(true), 10);


        inputRef.current?.focus();



        if (!socket) {
            console.warn("[ChatWindow] Socket instance is null/undefined. Cannot set up listeners.");
            return; 
        }

        console.log(`[ChatWindow] Setting up Socket.IO listeners for chat with ${user.name}`);


        socket.on('private_message', (msg) => {
            console.log(`[ChatWindow] Received private message:`, msg);






            if (
                (msg.senderId === user.id && msg.receiverId === currentUserId) ||
                (msg.senderId === currentUserId && msg.receiverId === user.id)
            ) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        text: msg.message, 
                        sender: msg.senderId === currentUserId ? 'me' : 'other', 

                        timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
                    },
                ]);
            }
        });


        socket.on('connect_error', (error) => {
            console.error("[ChatWindow] Socket connection error:", error);
        });
        socket.on('error', (error) => {
            console.error("[ChatWindow] Socket general error:", error);
        });





        return () => {
            console.log(`[ChatWindow] Cleaning up Socket.IO listeners for chat with ${user.name}`);

            if (socket) {
                socket.off('private_message');
                socket.off('connect_error');
                socket.off('error');
            }
        };
    }, [user.id, currentUserId, socket]); 





    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]); 


    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose(); 
            } else if (e.key === 'Enter' && document.activeElement === inputRef.current) {

                e.preventDefault(); 
                handleSend(); 
            }
        };


        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, handleSend]); 


    return (

        <div
            className={`chat-slideup-container ${
                visible ? 'chat-visible' : 'chat-hidden'
            }`}
        >
            <div className="chat-minimal">
                {}
                <div className="chat-header">
                    <span>{user.name}</span> {}
                    <button onClick={handleClose} aria-label="Close chat">✕</button> {}
                </div>

                {}
                <div className="chat-body">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx} 
                            className={`chat-message ${
                                msg.sender === 'me' ? 'chat-me' : 'chat-other'
                            }`}
                        >
                            <div>{msg.text}</div>
                            <div className="chat-time">{msg.timestamp}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} /> {}
                </div>

                {}
                <div className="chat-input">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message..."
                        aria-label="Type your message"
                    />
                    <button onClick={handleSend}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;