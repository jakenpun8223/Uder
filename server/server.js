import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// Import routes
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

const app = express();

// Secutity Middleware
app.use(helmet()) // Hides server info (e.g. "X-Powered-By: Express")
/*
// Rate Limiting (Prevent Brute Force on Login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: "Too many login attempts, please try again later"
});
app.use('/api/auth', authLimiter); // Apply ONLY to auth routes
*/
// 3. Middleware
// Dynamic CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", 
  process.env.CLIENT_URL // We will set this in Render later
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(express.json());
//app.use(express.json({ limit: '30mb' })); 
//app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cookieParser());

// --- ROUTES ---
app.use('/api/products', productRoutes); // Customer (Menu)
app.use('/api/auth', authRoutes); // Login & Register
app.use('/api/users', userRoutes); // Admin (Manage Staff)
app.use('/api/orders', orderRoutes); // Waiter/Kitchen (Orders)
app.use('/api/tables', tableRoutes);

// 4. Real-Time Setup (Socket.io)
// Dynamic Socket Origin
const server = http.createServer(app); // Wrap Express in a raw HTTP server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// [SECURE] Socket Middleware: Verify JWT from Cookie
// [SECURE] Socket Middleware: Verify JWT from Cookie (Optional for Guests)
io.use((socket, next) => {
  try {
      const cookieString = socket.handshake.headers.cookie;
      // If no cookie, just let them connect as a Guest (don't throw error)
      if (!cookieString) return next(); 

      const token = cookieString.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
      if (!token) return next(); // Let them connect as Guest

      // Verify Token for Staff/Admin
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; 
      next();
  } catch (err) {
      // If token is expired/invalid, let them connect as a Guest instead of disconnecting them
      next(); 
  }
});

app.set('socketio', io); // Allows routes to access 'io'

// Listen for real-time connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // --- FIX: Users must join their restaurant room ---
  socket.on('join_restaurant', (restaurantId) => {
    if (restaurantId) {
      socket.join(restaurantId);
      console.log(`Socket ${socket.id} joined restaurant: ${restaurantId}`);
    }
  });
  // ------------------------------------------------

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