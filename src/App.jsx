import { useState, useEffect, useRef } from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import ChatInput from './components/ChatInput';
import GifPicker from './components/GifPicker';
import ChatMessage from './components/ChatMessage';
import Linkify from 'linkify-react';

const WS_URL = window.location.hostname === 'localhost' 
  ? 'ws://localhost:3001'
  : `ws://${window.location.hostname}:3001`;

function App() {
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});

  const requestNotificationPermission = async () => {
    try {
      if (!("Notification" in window)) {
        alert("This browser does not support notifications");
        return;
      }

      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
      setNotificationsEnabled(permission === "granted");
      
      if (permission === "granted") {
        // Test notification
        new Notification("Notifications enabled!", {
          body: "You will now receive notifications for new messages",
        });
      } else if (permission === "denied") {
        alert("Please enable notifications to receive message alerts");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (username && !wsRef.current) {
      console.log('Connecting to WebSocket at:', WS_URL);
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log('WebSocket Connected');
        setConnected(true);
        wsRef.current.send(JSON.stringify({
          type: 'login',
          username: username
        }));
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        switch (data.type) {
          case 'private_message':
            console.log('Processing private message:', data.message);
            setPrivateMessages(prev => {
              const otherUser = data.message.sender === username ? 
                data.message.recipient : data.message.sender;
              return {
                ...prev,
                [otherUser]: [...(prev[otherUser] || []), data.message]
              };
            });
            showNotification(data.message.sender, data.message.text);
            break;
          case 'message':
            console.log('Processing public message:', data.message);
            setMessages(prev => [...prev, data.message]);
            showNotification(data.message.sender, data.message.text);
            break;
          case 'users':
            setOnlineUsers(data.users.filter(user => user !== username));
            break;
        }
      };
    }
  }, [username, notificationsEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, privateMessages, selectedUser]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedUser !== null) {
        setUnreadMessages(prev => ({
          ...prev,
          [selectedUser]: 0
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedUser]);

  const handleSendMessage = (message) => {
    if (connected && message.trim()) {
      if (selectedUser) {
        wsRef.current.send(JSON.stringify({
          type: 'private_message',
          message: message,
          recipient: selectedUser,
          messageType: 'text'
        }));
      } else {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          message: message,
          messageType: 'text'
        }));
      }
    }
  };

  const handleGifSelect = (gifUrl) => {
    if (connected) {
      if (selectedUser) {
        wsRef.current.send(JSON.stringify({
          type: 'private_message',
          message: gifUrl,
          messageType: 'gif',
          recipient: selectedUser
        }));
      } else {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          message: gifUrl,
          messageType: 'gif'
        }));
      }
    }
    setIsGifPickerOpen(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        if (selectedUser) {
          wsRef.current.send(JSON.stringify({
            type: 'private_message',
            message: imageUrl,
            messageType: 'image',
            recipient: selectedUser
          }));
        } else {
          wsRef.current.send(JSON.stringify({
            type: 'message',
            message: imageUrl,
            messageType: 'image'
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processMessage = (text) => {
    if (!text) return text;
    
    // Convert URLs to HTML links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const processed = text.replace(urlRegex, (url) => {
      return `<link>${url}</link>`;
    });
    
    return processed;
  };

  const showNotification = (sender, text) => {
    console.log("Attempting to show notification:", { sender, text });
    
    if (!notificationsEnabled) {
      console.log("Notifications not enabled");
      return;
    }

    if (sender === username) {
      console.log("Not showing notification for own message");
      return;
    }

    if (!document.hidden) {
      console.log("Tab is visible, not showing notification");
      return;
    }

    try {
      new Notification(`New message from ${sender}`, {
        body: text,
        icon: "/vite.svg",
        tag: "chat-message",
      });
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Clear unread count for selected user
    setUnreadMessages(prev => ({
      ...prev,
      [user]: 0
    }));
  };

  if (!username) {
    return <LoginScreen onLogin={setUsername} />;
  }

  const currentMessages = selectedUser 
    ? (privateMessages[selectedUser] || [])
    : messages;

  return (
    <div className="chat-app">
      <div className="sidebar">
        <h3>Online Users</h3>
        <div className="user-list">
          <div 
            className={`user-item ${!selectedUser ? 'selected' : ''}`}
            onClick={() => {
              setSelectedUser(null);
              setUnreadMessages(prev => ({ ...prev, public: 0 }));
            }}
          >
            <div className="user-item-content">
              <span>Public Chat</span>
              {unreadMessages.public > 0 && (
                <div className="unread-dot" />
              )}
            </div>
          </div>
          {onlineUsers.map(user => (
            <div
              key={user}
              className={`user-item ${selectedUser === user ? 'selected' : ''}`}
              onClick={() => {
                setSelectedUser(user);
                setUnreadMessages(prev => ({ ...prev, [user]: 0 }));
              }}
            >
              <div className="user-item-content">
                <span>{user}</span>
                {unreadMessages[user] > 0 && (
                  <div className="unread-dot" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chat-container">
        <div className="chat-header">
          {selectedUser ? `Chat with ${selectedUser}` : 'Public Chat'}
        </div>
        
        <div className="messages">
          {currentMessages.map((message) => (
            <ChatMessage 
              key={message.timestamp} 
              message={message} 
              username={username}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <button 
            className="media-button"
            onClick={() => setIsGifPickerOpen(true)}
          >
            GIF
          </button>
          <button 
            className="media-button"
            onClick={() => fileInputRef.current?.click()}
          >
            📷
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      {isGifPickerOpen && (
        <div className="gif-picker-container">
          <GifPicker 
            onGifSelect={handleGifSelect}
            onClose={() => setIsGifPickerOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default App;
