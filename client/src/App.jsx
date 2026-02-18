import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import useAuth from "./hooks/useAuth";
import { useEffect } from "react";

// Components & Pages
import { CartProvider } from "./context/CartContext";
import { WaiterProvider } from "./context/WaiterContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import KitchenDashboard from "./pages/KitchenDashboard";
import MenuManager from "./pages/MenuManager";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import StaffManagement from "./pages/StaffManagement";
import WaiterDashboard from "./pages/WaiterDashboard";
import ScanSession from './pages/ScanSession';
import TableManagement from './pages/TableManagement'; 
import { socket } from "./socket";

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

// Wrapper component to handle Socket Join
const SocketManager = () => {
    const { user } = useAuth();

    useEffect(() => {
        // Only try to join if user exists and has a restaurant ID
        if (user && user.restaurant && socket) {
            console.log("Joining restaurant room:", user.restaurant);
            socket.emit('join_restaurant', user.restaurant);
        }
    }, [user]); // Only re-run if user changes

    return null; // This component renders nothing, just handles logic
};

function App() {
  useEffect(() => {
    if(socket) {
        socket.on('connect', () => console.log('Connected to server:', socket.id));
        return () => socket.off('connect');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WaiterProvider>
            {/* Active Socket Manager inside Auth Context */}
            <SocketManager />
            
            <Navbar />
            <div className="container mx-auto p-4">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/scan/:restaurantId/:tableNumber" element={<ScanSession />} />

                {/* Shared Routes */}
                <Route element={<ProtectedRoute allowedRoles={['kitchen', 'admin', 'staff']} />}>
                    <Route path='/checkout' element={<Checkout />} />
                    <Route path='/waiter' element={<WaiterDashboard />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoute allowedRoles={["kitchen", "admin"]} />
                  }
                >
                  <Route
                    path="/kitchen"
                    element={<KitchenDashboard socket={socket} />}
                  />
                  <Route path="/manage-menu" element={<MenuManager />} />
                </Route>

                {/* Admin Only */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
                    <Route path="/manage-tables" element={<TableManagement />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/staff" element={<StaffManagement />} />
                </Route>

                <Route path="*" element={<Navigate to="/menu" />} />
              </Routes>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
              }}
            />
          </WaiterProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
