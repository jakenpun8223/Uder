import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';

const Checkout = () => {
    const { t } = useTranslation();
    const { cart, cartTotal, removeFromCart, clearCart } = useCart();
    const [searchParams] = useSearchParams(); 
    
    const urlTable = searchParams.get('table');
    const [tableNumber, setTableNumber] = useState(urlTable || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
                <Link to="/menu" className="mt-4 text-primary font-bold hover:underline">Go back to Menu</Link>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');

        try {
            const orderItems = cart.map(item => ({
                product: item._id, quantity: item.quantity, name: item.name, price: item.price
            }));
            await axios.post('/orders', {
                tableNumber: parseInt(tableNumber), items: orderItems, totalAmount: cartTotal
            });
            clearCart();
            navigate('/menu'); 
        } catch (err) {
            setError(err.response?.data?.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6 pb-20">
            <h1 className="text-2xl md:text-3xl font-black mb-6 text-gray-800">{t('checkout')}</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="font-bold text-gray-700">{t('order_summary')}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {cart.map((item) => (
                        <div key={item._id} className="p-4 flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-3">
                            <div className="flex-1 w-full">
                                <h4 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h4>
                                <p className="text-sm text-gray-500 font-medium">₪{item.price} x {item.quantity}</p>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-4 rtl:space-x-reverse">
                                <span className="font-bold text-gray-800 text-lg">
                                    ₪{(item.price * item.quantity).toFixed(2)}
                                </span>
                                <button 
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-1 rounded"
                                >
                                    {t('remove')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-xl text-gray-700">{t('total')}</span>
                    <span className="font-black text-2xl text-primary">₪{cartTotal.toFixed(2)}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 font-medium text-sm">{error}</div>}

                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">{t('table_number')}</label>
                    <input 
                        type="number" min="1" required
                        value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg font-bold"
                    />
                </div>

                <button 
                    type="submit" disabled={loading}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-black py-4 rounded-xl text-lg transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                    {loading ? t('sending_order') : t('place_order')}
                </button>
            </form>
        </div>
    );
};

export default Checkout;