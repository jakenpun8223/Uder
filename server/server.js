import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js' // Ensure you added 'export default' in db.js

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

const app = express();

// 3. Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json());
app.use('/api/products', productRoutes) // Allow backend to read JSON data

// 4. Real-Time Setup (Socket.io)
const server = http.createServer(app); // Wrap Express in a raw HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL of your React Client (Vite default)
    methods: ["GET", "POST"]
  }
});

// Listen for real-time connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Example: Listen for a new order
  socket.on('send_order', (data) => {
    // Broadcast the order to the Kitchen
    io.emit('receive_order', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// 5. Basic Routes
app.get('/', (req, res) => {
  res.send('Uder API is running...');
});

// Import other routes later (e.g., app.use('/api/menu', menuRoutes))

// 6. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});