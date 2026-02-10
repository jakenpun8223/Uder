import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth'; 
import { useEffect } from 'react';

// Components & Pages
import { CartProvider } from './context/CartContext';
import { WaiterProvider } from './context/WaiterContext';
import WaiterNotifications from './components/WaiterNotifications';
import Navbar from './components/Navbar';
import Login from './pages/Login'; 
import Register from './pages/Register';
import KitchenDashboard from './pages/KitchenDashboard';
import MenuManager from './pages/MenuManager';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import StaffManagement from './pages/StaffManagement';
import WaiterDashboard from './pages/WaiterDashboard';
// 1. IMPORT THE NEW PAGE HERE
import TableManagement from './pages/TableManagement'; 
import { socket } from './socket';

// Security Guard
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     return <Navigate to="/menu" />; 
  }
  return <Outlet />;
};

function App() {
  useEffect(() => {
    socket.on('connect', () => console.log('Connected:', socket.id));
    return () => socket.off('connect');
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WaiterProvider>
            <Navbar />
            <WaiterNotifications />
            
            <div className="container mx-auto p-4">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/menu" element={<Menu />} />

                <Route element={<ProtectedRoute allowedRoles={['kitchen', 'admin', 'staff']} />}>
                    <Route path='/checkout' element={<Checkout />} />
                    <Route path='/waiter' element={<WaiterDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['kitchen', 'admin']} />}>
                    <Route path="/kitchen" element={<KitchenDashboard socket={socket} />} />
                    <Route path="/manage-menu" element={<MenuManager />} />
                </Route>

                {/* --- ADMIN ONLY --- */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/staff" element={<StaffManagement />} />
                    {/* 2. ADD THE ROUTE HERE */}
                    <Route path="/manage-tables" element={<TableManagement />} />
                </Route>

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