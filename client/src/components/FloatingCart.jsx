import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ShoppingBag } from 'lucide-react';

const FloatingCart = ({ tableNumber }) => {
    const { t } = useTranslation();
    const { cart, cartTotal, clearCart } = useCart();

    if (cart.length === 0) return null;
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const checkoutUrl = tableNumber ? `/checkout?table=${tableNumber}` : '/checkout';

    return (
        <div className="fixed bottom-4 md:bottom-6 left-0 right-0 px-4 flex justify-center z-50">
            <button 
                onClick={() => { if(window.confirm(t('clear_cart'))) clearCart(); }}
                className="bg-white text-red-500 shadow-xl rounded-full p-3 h-14 w-14 flex items-center justify-center hover:bg-red-50 transition border border-red-100 mx-2"
            >
                <X size={24} />
            </button>

            <Link 
                to={checkoutUrl} 
                className="bg-primary hover:bg-orange-600 text-white shadow-xl rounded-full px-5 py-3 md:px-6 md:py-4 w-full max-w-sm md:max-w-md flex justify-between items-center transition-transform transform hover:-translate-y-1"
            >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="bg-white text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                        {totalItems}
                    </span>
                    <span className="font-bold text-base md:text-lg flex items-center gap-2">
                        <ShoppingBag size={18} /> {t('view_order')}
                    </span>
                </div>
                
                <span className="font-black text-lg md:text-xl">
                    ₪{cartTotal.toFixed(2)}
                </span>
            </Link>
        </div>
    );
};

export default FloatingCart;