// client/src/socket.js
import { io } from 'socket.io-client';

// Use the environment variable or default to localhost
const URL = 'http://localhost:5000';

export const socket = io(URL, {
    withCredentials: true,
    autoConnect: true,
    transports: ['websocket', 'polling'] // Force stable connection methods
});