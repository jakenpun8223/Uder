// client/src/socket.js
import { io } from 'socket.io-client';

// Extract the base URL without '/api' for Socket.io
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socketURL = apiURL.replace('/api', '');

export const socket = io(socketURL, {
    withCredentials: true,
    autoConnect: true,
    transports: ['websocket', 'polling'] 
});