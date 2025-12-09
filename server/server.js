import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

const app = express();

// Secutity Middleware
app.use(helmet()) // Hides server info (e.g. "X-Powered-By: Express")

// Rate Limiting (Prevent Brute Force on Login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: "Too mant login attempts, please try again later"
});
app.use('/api/auth', authLimiter); // Apply ONLY to auth routes

// 3. Middleware
app.use(cors({
  origin: "http://localhost:5173", // My frontend URL
  credentials: true // CRITICAL: Allows cookies to be sent 
})); // Allow frontend to talk to backend
app.use(express.json());
app.use(cookieParser());

// --- ROUTES ---
app.use('/api/products', productRoutes); // Customer (Menu)
app.use('/api/auth', authRoutes); // Login & Register
app.use('/api/users', userRoutes); // Admin (Manage Staff)
app.use('/api/orders', orderRoutes); // Waiter/Kitchen (Orders)

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
  console.log('User connected:', socket.id);

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