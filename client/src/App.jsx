import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth'; 
import { io } from 'socket.io-client';
import { useEffect } from 'react';

// Components & Pages
import Navbar from './components/Navbar';
import Login from './pages/Login'; 
import Register from './pages/Register';
import KitchenDashboard from './pages/KitchenDashboard';
import MenuManager from './pages/MenuManager'; // IMPORTED
import Menu from './pages/Menu'; // IMPORTED

// Initialize Socket
const socket = io('http://localhost:5000');

// Security Guard
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  // Role Check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     return <Navigate to="/menu" />; // Redirect unauthorized users to menu
  }
  
  return <Outlet />;
};

function App() {
  useEffect(() => {
    socket.on('connect', () => console.log('Connected to Server:', socket.id));
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        
        <div className="container mx-auto p-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<Menu />} />
            {/* REPLACED */}

            {/* Kitchen & Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['kitchen', 'admin']} />}>
                <Route path="/kitchen" element={<KitchenDashboard socket={socket} />} />
                <Route path="/manage-menu" element={<MenuManager />} /> {/* NEW */} 
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/menu" />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;