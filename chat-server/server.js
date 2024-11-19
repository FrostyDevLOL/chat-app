const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Store connected users
const users = new Map();

// Add this helper function at the top
function sanitizeMessage(text) {
  if (!text) return text;
  return text.replace(/[<>]/g, ''); // Remove < and > characters
}

wss.on('connection', (ws) => {
  let username = '';

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      switch (data.type) {
        case 'login':
          username = data.username;
          users.set(username, ws);
          // Send user list to all clients
          const userList = Array.from(users.keys());
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'users',
                users: userList
              }));
            }
          });
          break;

        case 'message':
          const processedMessage = data.message;

          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'message',
                message: {
                  text: sanitizeMessage(processedMessage),
                  sender: username,
                  timestamp: new Date().toISOString(),
                  messageType: data.messageType || 'text'
                }
              }));
            }
          });
          break;

        case 'private_message':
          const processedPrivateMessage = data.message;

          const targetWs = users.get(data.recipient);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            const messageObj = {
              text: sanitizeMessage(processedPrivateMessage),
              sender: username,
              recipient: data.recipient,
              timestamp: new Date().toISOString(),
              messageType: data.messageType || 'text'
            };

            targetWs.send(JSON.stringify({
              type: 'private_message',
              message: messageObj
            }));

            ws.send(JSON.stringify({
              type: 'private_message',
              message: messageObj
            }));
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    if (username) {
      users.delete(username);
      // Update user list for remaining clients
      const userList = Array.from(users.keys());
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'users',
            users: userList
          }));
        }
      });
    }
  });
});

server.listen(3001, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3001');
});