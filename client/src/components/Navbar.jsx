import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-md p-4 mb-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/menu" className="text-2xl font-black tracking-tighter text-gray-800">
                    UDER<span className="text-primary">.</span>
                </Link>

                <div className="flex items-center gap-6 font-bold text-sm uppercase tracking-wide">
                    <Link to="/menu" className="hover:text-primary">Menu</Link>
                    
                    {/* ONLY SHOW IF USER IS LOGGED IN */}
                    {user ? (
                        <>
                            {/* KITCHEN (Admins & Kitchen Staff) */}
                            {['admin', 'kitchen'].includes(user.role) && (
                                <Link to="/kitchen" className="hover:text-primary">Kitchen</Link>
                            )}
                            
                            {/* MANAGE MENU (Admins & Kitchen Staff) */}
                            {['admin', 'kitchen'].includes(user.role) && (
                                <Link to="/manage-menu" className="hover:text-primary">Menu Mgr</Link>
                            )}

                            {/* STAFF (Admins ONLY) - THIS IS THE MISSING LINK */}
                            {user.role === 'admin' && (
                                <Link to="/staff" className="text-secondary hover:opacity-80">Manage Staff</Link>
                            )}

                            <div className="flex items-center gap-4 ml-4 border-l pl-4 border-gray-300">
                                <span className="text-xs text-gray-400 normal-case">{user.email}</span>
                                <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="px-4 py-2 hover:text-primary">Login</Link>
                            <Link to="/register" className="bg-primary text-white px-4 py-2 rounded hover:bg-orange-600">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;