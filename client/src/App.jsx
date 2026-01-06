import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth'; 
import { io } from 'socket.io-client';
import { useEffect } from 'react';

// Components & Pages
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login'; 
import Register from './pages/Register';
import Menu from './pages/Menu';

// Initialize Socket
const socket = io('http://localhost:5000');

// Security Guard
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
};

// Placeholders
const KitchenDashboard = () => <h1 className="text-2xl p-4">Kitchen Dashboard (Private)</h1>;

function App() {
  useEffect(() => {
    socket.on('connect', () => console.log('Connected to Server:', socket.id));
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Navbar is here so it appears on ALL pages */}
        <Navbar />
        
        <div className="container mx-auto p-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<Menu />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/kitchen" element={<KitchenDashboard />} />
                <Route path="/admin" element={<h1>Admin Panel</h1>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/menu" />} />
          </Routes>
          <CartProvider />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;