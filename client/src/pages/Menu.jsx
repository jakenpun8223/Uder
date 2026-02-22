import { useEffect, useState } from 'react';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';
import FloatingCart from '../components/FloatingCart';
import CallWaiter from '../components/CallWaiter';
import useAuth from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { socket } from '../socket';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const CATEGORIES = [
    { key: 'cat_all', value: 'All' },
    { key: 'cat_main', value: 'Main' },
    { key: 'cat_sushi', value: 'Sushi' },
    { key: 'cat_drinks', value: 'Drinks' },
    { key: 'cat_dessert', value: 'Dessert' },
    { key: 'cat_starters', value: 'Starters' }
];

const Menu = () => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { setRestaurantId, restaurantId: storedRestaurantId } = useCart();
    
    const urlRestaurantId = searchParams.get('restaurant');
    const guestRestaurantId = localStorage.getItem('guest_restaurantId');
    const activeRestaurantId = user?.restaurant || urlRestaurantId || guestRestaurantId || storedRestaurantId;

    useEffect(() => {
        if (activeRestaurantId && activeRestaurantId !== storedRestaurantId) {
            setRestaurantId(activeRestaurantId);
        }
    }, [activeRestaurantId, storedRestaurantId, setRestaurantId]);

    // Handle RTL layout for Hebrew
    useEffect(() => {
        document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const urlTable = searchParams.get('table');
    const guestTable = localStorage.getItem('guest_tableNumber');
    const activeTable = urlTable || guestTable;

    useEffect(() => {
        if (urlTable) localStorage.setItem('guest_tableNumber', urlTable);
    }, [urlTable]);
    
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchProducts = async () => {
            if (!activeRestaurantId) {
                if (isMounted) setLoading(false); 
                return;
            }
            try {
                setLoading(true);
                const { data } = await axios.get(`/products?restaurantId=${activeRestaurantId}`, { signal: controller.signal });
                if (isMounted) setProducts(data);
            } catch (err) {
                if (isMounted && err.name !== 'Canceled') setError("Failed to load menu.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProducts();
        return () => { isMounted = false; controller.abort(); };
    }, [activeRestaurantId]);

    // REAL-TIME MENU UPDATES
    useEffect(() => {
        if (!activeRestaurantId) return;

        // 1. FORCE GUESTS TO JOIN THE ROOM (Critical for customers to receive updates)
        socket.emit('join_restaurant', String(activeRestaurantId));

        const handleMenuUpdate = (updatedProduct) => {
            // Force string comparison just in case
            if (String(updatedProduct.restaurant) !== String(activeRestaurantId)) return;
            
            setProducts((prev) => {
                if (updatedProduct.isAvailable) {
                    const exists = prev.find(p => p._id === updatedProduct._id);
                    if (exists) return prev.map(p => p._id === updatedProduct._id ? updatedProduct : p);
                    return [...prev, updatedProduct];
                } else {
                    return prev.filter(p => p._id !== updatedProduct._id);
                }
            });
        };

        const handleMenuDelete = (deletedId) => {
            setProducts((prev) => prev.filter(p => p._id !== deletedId));
        };

        socket.on('menu_updated', handleMenuUpdate);
        socket.on('menu_deleted', handleMenuDelete);

        return () => {
            socket.off('menu_updated', handleMenuUpdate);
            socket.off('menu_deleted', handleMenuDelete);
        };
    }, [activeRestaurantId]);

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    if (loading) return <div className="text-center p-10 font-bold text-gray-500">{t('loading')}</div>;
    
    if (!activeRestaurantId) return (
        <div className="text-center p-10 flex flex-col items-center justify-center h-screen">
            <h2 className="text-2xl font-bold text-gray-800">{t('welcome')}</h2>
            <p className="text-gray-500 mt-2">{t('scan_prompt')}</p>
        </div>
    );

    const isStaff = user && ['staff', 'admin', 'kitchen'].includes(user.role);

    return (
        <div className="max-w-7xl mx-auto pb-24 p-4 md:p-6">
            
            {/* Language Switcher */}
            <div className="flex justify-end mb-4">
                <div className="flex items-center bg-white border rounded-lg px-3 py-1 shadow-sm">
                    <Globe size={16} className="text-gray-500 mx-2" />
                    <select 
                        onChange={changeLanguage} 
                        value={i18n.language}
                        className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        <option value="en">English</option>
                        <option value="he">עברית</option>
                        <option value="ru">Русский</option>
                    </select>
                </div>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto space-x-3 rtl:space-x-reverse py-2 mb-6 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                            selectedCategory === cat.value 
                            ? 'bg-primary text-white border-primary shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {t(cat.key)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center text-gray-500 mt-10 p-6 bg-gray-50 rounded-lg">
                    {t('no_items')} <span className="font-bold">{t(`cat_${selectedCategory.toLowerCase()}`)}</span>.
                </div>
            )}
            
            {isStaff ? <FloatingCart tableNumber={activeTable} /> : <CallWaiter />}
        </div>
    );
};

export default Menu;