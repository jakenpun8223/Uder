import { useEffect, useState } from 'react';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';
import FloatingCart from '../components/FloatingCart';
import CallWaiter from '../components/CallWaiter';
import useAuth from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { socket } from '../socket';

const CATEGORIES = ['All', 'Main', 'Sushi', 'Drinks', 'Dessert', 'Starters'];

const Menu = () => {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { setRestaurantId, restaurantId: storedRestaurantId } = useCart();
    
    // 1. ROBUST ID RESOLUTION: Check User -> URL -> LocalStorage -> Context
    const urlRestaurantId = searchParams.get('restaurant');
    const guestRestaurantId = localStorage.getItem('guest_restaurantId');
    const activeRestaurantId = user?.restaurant || urlRestaurantId || guestRestaurantId || storedRestaurantId;

    // Sync ID to Context/Storage so it persists
    useEffect(() => {
        if (activeRestaurantId && activeRestaurantId !== storedRestaurantId) {
            setRestaurantId(activeRestaurantId);
        }
    }, [activeRestaurantId, storedRestaurantId, setRestaurantId]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // 2. Single, Unified Fetch Effect
    useEffect(() => {
        let isMounted = true; // Prevents state updates if component unmounts
        const controller = new AbortController();

        const fetchProducts = async () => {
            // If we STILL don't have an ID, show the "Please scan" screen
            if (!activeRestaurantId) {
                if (isMounted) setLoading(false); 
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // Fetch using activeRestaurantId
                const { data } = await axios.get(`/products?restaurantId=${activeRestaurantId}`, {
                    signal: controller.signal
                });
                
                if (isMounted) setProducts(data);
            } catch (err) {
                if (isMounted && err.name !== 'Canceled') {
                    console.error("Fetch error:", err);
                    setError("Failed to load menu. Please scan the QR code again.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [activeRestaurantId]);

    // Real-Time Inventory Updates
    useEffect(() => {
        if (!activeRestaurantId) return;

        const handleMenuUpdate = (updatedProduct) => {
            // Security: Ignore updates from other restaurants
            if (updatedProduct.restaurant !== activeRestaurantId) return;

            setProducts((prevProducts) => {
                if (updatedProduct.isAvailable) {
                    // Item is now AVAILABLE: Add it or Update it
                    const exists = prevProducts.find(p => p._id === updatedProduct._id);
                    if (exists) return prevProducts.map(p => p._id === updatedProduct._id ? updatedProduct : p);
                    return [...prevProducts, updatedProduct];
                } else {
                    // Item is now SOLD OUT: Remove it from the list
                    return prevProducts.filter(p => p._id !== updatedProduct._id);
                }
            });
        };

        socket.on('menu_updated', handleMenuUpdate);

        // Cleanup listener when leaving page
        return () => {
            socket.off('menu_updated', handleMenuUpdate);
        };
    }, [activeRestaurantId]);

    // Filter Logic
    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    if (loading) return <div className="text-center p-10 font-bold text-gray-500">Loading Menu...</div>;
    
    if (!activeRestaurantId) return (
        <div className="text-center p-10 flex flex-col items-center justify-center h-screen">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Uder</h2>
            <p className="text-gray-500 mt-2">Please scan a table's QR code to view the menu.</p>
        </div>
    );

    if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

    const isStaff = user && ['staff', 'admin', 'kitchen'].includes(user.role);
    
    // Grab table number from URL or Guest Storage
    const tableNumber = searchParams.get('table') || localStorage.getItem('guest_tableNumber');

    return (
        <div className="max-w-7xl mx-auto pb-20 p-4">
            {/* Category Filter */}
            <div className="flex overflow-x-auto space-x-4 py-4 mb-6 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${
                            selectedCategory === cat 
                            ? 'bg-primary text-white border-primary shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center text-gray-500 mt-10 p-6 bg-gray-50 rounded-lg">
                    No items found in <span className="font-bold">{selectedCategory}</span>.
                </div>
            )}
            
            {/* Waiter sees Cart with table number, Guest sees Call Waiter */}
            {isStaff ? <FloatingCart tableNumber={tableNumber} /> : <CallWaiter />}
        </div>
    );
};

export default Menu;