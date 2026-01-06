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

    // We need to know WHICH restaurant's menu to load
    // If we are staff (logged in), we use our user data.
    // If we are a guest, we MUST get it from the URL.

    const { user } = useAuth();
    const urlRestaurantId = searchParams.get('restaurant');

    // Logic: Use Logged-in Restaurant ID OR URL Restaurant ID
    const targetRestaurantId = user?.restaurant || urlRestaurantId;

    useEffect(() => {
        const fetchProducts = async () => {
            if (!targetRestaurantId) return; // Wait until we know the ID

            try {
                // Pass restaurantId to the backend
                const { data } = await axios.get(`/products?restaurantId=${targetRestaurantId}`);
                setProducts(data);
            } catch (err) {
               // ...
            }
        };
        fetchProducts();
    }, [targetRestaurantId]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch only available products (Public Route)
                const { data } = await axios.get('/products');
                setProducts(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load menu.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter Logic
    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    if (loading) return <div className="text-center p-10">Loading tasty food...</div>;
    if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

    const isStaff = user && (user.role === 'staff' || user.role === 'admin');

    return (
        <div className="max-w-7xl mx-auto pb-20"> {/* pb-20 for floating cart space later */}
            
            {/* Category Filter */}
            <div className="flex overflow-x-auto space-x-4 py-4 mb-6 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                            selectedCategory === cat 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-white text-gray-600 hover:bg-gray-100'
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
                <div className="text-center text-gray-500 mt-10">
                    No items found in {selectedCategory}.
                </div>
            )}
            
            {isStaff ? (
                <FloatingCart />
            ) : (
                <CallWaiter />
            )}
        </div>
    );
};

export default Menu;