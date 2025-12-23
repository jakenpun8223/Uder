import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth'; // We will create this small hook next
import { io } from 'socket.io-client';
import { useEffect } from 'react';

// Initialize Socket
const socket = io('http://localhost:5000');

// --- SECURITY GUARD COMPONENT ---
// This component wraps pages that need login.
// If user is NOT logged in, it kicks them to '/login'.
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <h1>Loading...</h1>; // Wait for the check to finish
  
  return user ? <Outlet /> : <Navigate to="/login" />;
};

// --- PAGES (Placeholders for now) ---
const Login = () => <h1>Login Page (To be built)</h1>;
const KitchenDashboard = () => <h1>Kitchen Dashboard (Private)</h1>;
const Menu = () => <h1>Menu Page (Public)</h1>;

function App() {
  useEffect(() => {
    socket.on('connect', () => console.log('Connected to Server:', socket.id));
  }, []);

  return (
    <BrowserRouter>
      {/* 1. Wrap the app in AuthProvider so everyone can access 'user' */}
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES (Anyone can see) */}
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />

          {/* PROTECTED ROUTES (Only logged in users) */}
          <Route element={<ProtectedRoute />}>
              <Route path="/kitchen" element={<KitchenDashboard />} />
              <Route path="/admin" element={<h1>Admin Panel</h1>} />
          </Route>

          {/* Catch all - Redirect to menu */}
          <Route path="*" element={<Navigate to="/menu" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;