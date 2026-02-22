import { useCart } from '../context/CartContext';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Plus, Minus } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { t } = useTranslation();
    const { addToCart, removeFromCart, cart } = useCart();
    const { user } = useAuth();
    
    const isStaff = user && (user.role === 'staff' || user.role === 'admin');
    const cartItem = cart.find(item => item._id === product._id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition-shadow h-full">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{product.name}</h3>
                    {/* Changed to Shekel */}
                    <span className="text-primary font-bold text-lg">₪{product.price}</span>
                </div>
                
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                    {product.description || "No description available."}
                </p>

                {product.allergens && product.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {product.allergens.map((allergen) => (
                            <span key={allergen} className="text-[10px] uppercase font-bold tracking-wider bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                {allergen}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100">
                {isStaff ? (
                    <>
                        {quantity === 0 ? (
                            <button 
                                onClick={() => addToCart(product)}
                                className="w-full bg-gray-100 hover:bg-primary hover:text-white text-gray-700 font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> {t('add_to_order')}
                            </button>
                        ) : (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1 border">
                                <button 
                                    onClick={() => removeFromCart(product._id)}
                                    className="w-10 h-10 flex items-center justify-center bg-white shadow-sm border text-red-600 rounded-md hover:bg-red-50 transition"
                                >
                                    <Minus size={20} />
                                </button>
                                
                                <span className="font-bold text-gray-800 text-lg">{quantity}</span>
                                
                                <button 
                                    onClick={() => addToCart(product)}
                                    className="w-10 h-10 flex items-center justify-center bg-primary shadow-sm text-white rounded-md hover:bg-orange-600 transition"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-xs text-gray-400 italic">
                        {t('ask_waiter')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;