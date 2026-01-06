import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth'; 
import { io } from 'socket.io-client';
import { useEffect } from 'react';

// Components & Pages
import { CartProvider } from './context/CartContext';
import { WaiterProvider } from './context/WaiterContext';
import WaiterNotifications from './components/WaiterNotifications';
import TableSelector from './components/TableSelector';
import Navbar from './components/Navbar';
import Login from './pages/Login'; 
import Register from './pages/Register';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import StaffManagement from './pages/StaffManagement';
import { socket } from './socket';

// Security Guard
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
};

// Placeholders
const KitchenDashboard = () => (
    <div>
        <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>
        
        {/* The Waiter configures their tables here */}
        <TableSelector />
        
        <div className="bg-gray-100 p-8 rounded text-center">
            <h2 className="text-xl">Active Orders (Coming Soon...)</h2>
        </div>
    </div>
);

function App() {
  useEffect(() => {
    socket.on('connect', () => console.log('Connected:', socket.id));
    return () => socket.off('connect');
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Navbar is here so it appears on ALL pages */}
        <CartProvider>
          <WaiterProvider>
            <Navbar />

            <WaiterNotifications />
            
            <div className="container mx-auto p-4">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/menu" element={<Menu />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path='/checkout' element={<Checkout />} />
                    <Route path="/kitchen" element={<KitchenDashboard />} />
                    <Route path="/admin" element={<h1>Admin Panel</h1>} />
                    <Route path="/staff" element={<StaffManagement />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/menu" />} />
              </Routes>
            </div>
          </WaiterProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;