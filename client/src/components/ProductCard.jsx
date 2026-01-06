import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart, removeFromCart, cart } = useCart();
    
    // Check quantity
    const cartItem = cart.find(item => item._id === product._id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between hover:shadow-md transition-shadow h-full">
            <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{product.name}</h3>
                    <span className="text-primary font-bold text-lg">${product.price}</span>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                    {product.description || "No description available."}
                </p>

                {/* Allergens - Based on your Product Model Enum */}
                {product.allergens && product.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {product.allergens.map((allergen) => (
                            <span 
                                key={allergen} 
                                className="text-[10px] uppercase font-bold tracking-wider bg-orange-100 text-orange-700 px-2 py-1 rounded"
                            >
                                {allergen}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-auto pt-4 border-t border-gray-100">
                {quantity === 0 ? (
                    <button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-gray-100 hover:bg-primary hover:text-white text-gray-700 font-bold py-2 rounded-lg transition-colors"
                    >
                        Add to Order
                    </button>
                ) : (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                        <button 
                            onClick={() => removeFromCart(product._id)}
                            className="w-10 h-10 flex items-center justify-center bg-white text-red-500 shadow-sm rounded-md hover:bg-red-50 transition"
                        >
                            -
                        </button>
                        
                        <span className="font-bold text-gray-800">{quantity}</span>
                        
                        <button 
                            onClick={() => addToCart(product)}
                            className="w-10 h-10 flex items-center justify-center bg-primary text-white shadow-sm rounded-md hover:bg-orange-600 transition"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;