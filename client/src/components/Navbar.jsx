import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/menu" className="text-2xl font-bold text-primary">
              Uder
            </Link>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-4">
            <Link to="/menu" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium">
              Menu
            </Link>

            {user ? (
              // Show these if Logged In
              <>
                <Link to="/kitchen" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium">
                  Kitchen
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              // Show these if Logged Out
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md font-medium">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;