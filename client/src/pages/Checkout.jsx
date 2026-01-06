import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

const Checkout = () => {
    const { cart, cartTotal, removeFromCart, clearCart } = useCart();
    const [tableNumber, setTableNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Prevent submission if empty
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
                <Link to="/menu" className="mt-4 text-primary hover:underline">Go to Menu</Link>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Transform cart to match Order Model schema
            const orderItems = cart.map(item => ({
                product: item._id,
                quantity: item.quantity,
                name: item.name,   // Snapshot name
                price: item.price  // Snapshot price
            }));

            // POST to backend
            await axios.post('/orders', {
                tableNumber: parseInt(tableNumber), // Ensure number type
                items: orderItems,
                totalAmount: cartTotal
            });

            clearCart();
            alert('Order placed successfully!');
            navigate('/menu'); 

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h1>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-700">Order Summary</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {cart.map((item) => (
                        <div key={item._id} className="p-4 flex justify-between items-center">
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <p className="text-sm text-gray-500">${item.price} x {item.quantity}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="font-bold text-gray-800">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button 
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-xl text-gray-700">Total</span>
                    <span className="font-bold text-xl text-primary">${cartTotal.toFixed(2)}</span>
                </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">Table Number</label>
                    <input 
                        type="number"
                        min="1"
                        required
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="Enter your table number (e.g., 5)"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Sending Order...' : 'Place Order'}
                </button>
            </form>
        </div>
    );
};

export default Checkout;