# Real-Time Chat Application

A modern real-time chat application built with React, WebSocket, and Node.js.

## Features

- Real-time messaging
- Public and private chat rooms
- GIF support via GIPHY API
- Image sharing
- Desktop notifications
- User presence detection

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Quick Start

1. Clone the repository:

git clone <repository-url>
cd chat-app

2. Install dependencies:

## Install client dependencies

npm install

## Install server dependencies

cd chat-server
npm install


3. Start the website:

cd chat-server
node server.js

The website runs on `http://localhost:3001`

## Login Details

- Username: Choose any username
- Password: `skibidi69420`

## Features Guide

### Public Chat

- Available to all users
- Messages are broadcast to everyone

### Private Messages

- Click on a username in the sidebar
- Messages are only visible to sender and recipient

### Media Sharing

- 📷 Camera icon: Share images
- GIF button: Search and share GIFs

### Notifications

- Browser notifications for new messages when tab is not focused
- Unread message indicators in sidebar

## Development

The application uses:
- Vite for frontend development
- WebSocket for real-time communication
- Express.js for the server
- GIPHY API for GIF support
