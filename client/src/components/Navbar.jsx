import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { Globe, Menu as MenuIcon, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { restaurantId } = useCart(); 
    const { t, i18n } = useTranslation(); // IMPORTANT: Import translation hook
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuLink = restaurantId ? `/menu?restaurant=${restaurantId}` : '/menu';

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white shadow-md p-4 mb-4 relative z-50">
            <div className="container mx-auto flex justify-between items-center">
                
                <Link to={menuLink} className="text-2xl font-black tracking-tighter text-gray-800 notranslate">
                    UDER<span className="text-primary">.</span>
                </Link>

                {/* Mobile Hamburger Button */}
                <button 
                    className="md:hidden text-gray-600 focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6 font-bold text-sm uppercase tracking-wide">
                    <Link to={menuLink} className="hover:text-primary">{t('nav_menu')}</Link>
                    
                    {user ? (
                        <>
                            {['admin', 'kitchen'].includes(user.role) && (
                                <Link to="/kitchen" className="hover:text-primary">{t('nav_kitchen')}</Link>
                            )}
                            
                            {['admin', 'kitchen'].includes(user.role) && (
                                <Link to="/manage-menu" className="hover:text-primary">{t('nav_menu_mgr')}</Link>
                            )}

                            {['admin', 'staff'].includes(user.role) && (
                                <>
                                    <Link to="/waiter" className="text-blue-600 hover:opacity-80">{t('nav_my_station')}</Link>
                                    <Link to="/manage-tables" className="text-blue-600 hover:opacity-80">{t('nav_tables')}</Link>
                                </>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/staff" className="text-secondary hover:opacity-80">{t('nav_staff')}</Link>
                            )}

                            <div className="flex items-center gap-4 ml-2 border-l pl-4 border-gray-300 rtl:border-r rtl:pr-4 rtl:border-l-0 rtl:pl-0">
                                <span className="text-xs text-gray-400 normal-case">{user.email}</span>
                                <button onClick={logout} className="text-red-500 hover:text-red-700">{t('nav_logout')}</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="px-4 py-2 hover:text-primary">{t('nav_login')}</Link>
                        </div>
                    )}

                    {/* Language Selector Desktop */}
                    <div className="flex items-center bg-gray-50 border rounded-lg px-2 py-1 ml-2 rtl:mr-2">
                        <Globe size={16} className="text-gray-500 mr-1 rtl:ml-1" />
                        <select onChange={changeLanguage} value={i18n.language} className="bg-transparent outline-none text-xs font-bold text-gray-700 cursor-pointer">
                            <option value="en">EN</option>
                            <option value="he">HE</option>
                            <option value="ru">RU</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg flex flex-col p-4 gap-4 font-bold text-gray-700 uppercase z-50">
                    
                    <div className="flex items-center bg-gray-50 border rounded-lg px-3 py-2 w-fit mb-2">
                        <Globe size={18} className="text-gray-500 mr-2 rtl:ml-2 rtl:mr-0" />
                        <select onChange={changeLanguage} value={i18n.language} className="bg-transparent outline-none text-sm font-bold text-gray-700 w-full">
                            <option value="en">English</option>
                            <option value="he">עברית</option>
                            <option value="ru">Русский</option>
                        </select>
                    </div>

                    <Link to={menuLink} onClick={() => setIsMobileMenuOpen(false)}>{t('nav_menu')}</Link>
                    
                    {user ? (
                        <>
                            {['admin', 'kitchen'].includes(user.role) && (
                                <>
                                    <Link to="/kitchen" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_kitchen')}</Link>
                                    <Link to="/manage-menu" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_menu_mgr')}</Link>
                                </>
                            )}
                            
                            {['admin', 'staff'].includes(user.role) && (
                                <>
                                    <Link to="/waiter" className="text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_my_station')}</Link>
                                    <Link to="/manage-tables" className="text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_tables')}</Link>
                                </>
                            )}
                            
                            {user.role === 'admin' && (
                                <Link to="/staff" className="text-secondary" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_staff')}</Link>
                            )}

                            <div className="border-t pt-4 mt-2 flex flex-col gap-2">
                                <span className="text-xs text-gray-400 normal-case">{user.email}</span>
                                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left text-red-500 rtl:text-right">{t('nav_logout')}</button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-primary">{t('nav_login')}</Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;