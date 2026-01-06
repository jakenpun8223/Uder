import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const FloatingCart = () => {
    const { cart, cartTotal, clearCart } = useCart();

    // Don't show if cart is empty
    if (cart.length === 0) return null;

    // Calculate total items
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50">
            {/* NEW: Clear Cart Button (Small, separate button) */}
            <button 
                onClick={() => {
                    if(window.confirm('Clear current order?')) clearCart();
                }}
                className="bg-white text-red-500 shadow-xl rounded-full p-4 h-14 w-14 flex items-center justify-center hover:bg-red-50 transition border border-red-100"
                title="Clear Cart"
            >
                <span className="text-xl font-bold">✕</span>
            </button>

            {/* Main Checkout Button */}
            <Link 
                to="/checkout" // We will build this page later
                className="bg-primary hover:bg-orange-600 text-white shadow-xl rounded-full px-6 py-4 w-full max-w-md flex justify-between items-center transition-transform transform hover:-translate-y-1"
            >
                <div className="flex items-center space-x-2">
                    <span className="bg-white text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                        {totalItems}
                    </span>
                    <span className="font-semibold text-lg">View Order</span>
                </div>
                
                <span className="font-bold text-xl">
                    ${cartTotal.toFixed(2)}
                </span>
            </Link>
        </div>
    );
};

export default FloatingCart;