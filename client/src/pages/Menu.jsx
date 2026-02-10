import { useEffect, useState } from 'react';
import axios from '../api/axios';
import ProductCard from '../components/ProductCard';
import FloatingCart from '../components/FloatingCart';
import CallWaiter from '../components/CallWaiter';
import useAuth from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

const CATEGORIES = ['All', 'Main', 'Sushi', 'Drinks', 'Dessert', 'Starters'];

const Menu = () => {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    
    // 1. Determine the Restaurant ID
    // If logged in (Staff/Kitchen), use their ID.
    // If guest (Customer), use the URL param.
    const urlRestaurantId = searchParams.get('restaurant');
    const targetRestaurantId = user?.restaurant || urlRestaurantId;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // 2. Single, Unified Fetch Effect
    useEffect(() => {
        let isMounted = true; // Prevents state updates if component unmounts
        const controller = new AbortController();

        const fetchProducts = async () => {
            // If we don't have an ID yet, don't fetch anything (or show a landing page)
            if (!targetRestaurantId) {
                if (isMounted) {
                    setLoading(false); 
                    // Optional: Set a specific error if you want to force a selection
                    // setError("No restaurant selected."); 
                }
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // Pass restaurantId clearly in the query string
                const { data } = await axios.get(`/products?restaurantId=${targetRestaurantId}`, {
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
    }, [targetRestaurantId]); // Only re-run if the ID changes

    // Filter Logic
    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    if (loading) return <div className="text-center p-10 font-bold text-gray-500">Loading Menu...</div>;
    
    // 3. Handle Missing ID Case (Guest visited /menu without a link)
    if (!targetRestaurantId) return (
        <div className="text-center p-10">
            <h2 className="text-xl font-bold text-gray-700">Welcome to Uder</h2>
            <p className="text-gray-500">Please scan a restaurant QR code to view the menu.</p>
        </div>
    );

    if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

    const isStaff = user && (user.role === 'staff' || user.role === 'admin');

    return (
        <div className="max-w-7xl mx-auto pb-20">
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
            
            {isStaff ? <FloatingCart /> : <CallWaiter />}
        </div>
    );
};

export default Menu;