import React from 'react';
import MessageContent from './MessageContent';

const ChatMessage = ({ message, username }) => {
  const isMedia = message.messageType === 'gif' || message.messageType === 'image';
  const isBase64Image = message.text?.startsWith('data:image');

  return (
    <div className={`message ${message.sender === username ? 'user-message' : 'other-message'}`}>
      <span className="sender">{message.sender}</span>
      {isMedia || isBase64Image ? (
        <img 
          src={message.text} 
          alt="Media content" 
          className="message-media"
        />
      ) : (
        <MessageContent text={message.text} />
      )}
    </div>
  );
};

export default ChatMessage; 