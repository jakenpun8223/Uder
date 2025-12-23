import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth'; 
import { io } from 'socket.io-client';
import { useEffect } from 'react';

// Import the REAL Login page we created
import Login from './pages/Login'; 

// Initialize Socket
const socket = io('http://localhost:5000');

// --- SECURITY GUARD ---
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
};

// --- PLACEHOLDERS (We will build these next) ---
const KitchenDashboard = () => <h1 className="text-2xl p-4">Kitchen Dashboard (Private)</h1>;
const Menu = () => <h1 className="text-2xl p-4">Menu Page (Public)</h1>;

function App() {
  useEffect(() => {
    socket.on('connect', () => console.log('Connected to Server:', socket.id));
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
              <Route path="/kitchen" element={<KitchenDashboard />} />
              <Route path="/admin" element={<h1 className="p-4">Admin Panel</h1>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/menu" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;