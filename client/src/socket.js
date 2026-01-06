import { io } from 'socket.io-client';

// Create a single instance to be used throughout the app
export const socket = io('http://localhost:5000');