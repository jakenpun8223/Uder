import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isStaff = user?.role === 'kitchen' || user?.role === 'admin';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/menu" className="text-2xl font-black tracking-tight text-gray-800">
              Uder<span className="text-primary">.</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to="/menu" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md font-bold text-sm uppercase tracking-wide">
              Menu
            </Link>

            {user ? (
              <>
                {isStaff && (
                  <>
                    <Link to="/kitchen" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md font-bold text-sm uppercase tracking-wide">
                      Orders
                    </Link>
                    <Link to="/manage-menu" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md font-bold text-sm uppercase tracking-wide">
                      Manage Menu
                    </Link>
                  </>
                )}
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md font-bold text-sm transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md font-bold text-sm uppercase tracking-wide">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-md font-bold text-sm transition"
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