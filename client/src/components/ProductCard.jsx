import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();

  // Check if item is already in cart to show quantity
  const cartItem = cart.find((item) => item._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
          <span className="text-primary font-bold">${product.price}</span>
        </div>

        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>

        {/* Allergens Badges */}
        {product.allergens && product.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.allergens.map((allergen) => (
              <span
                key={allergen}
                className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full"
              >
                {allergen}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        {quantity > 0 ? (
          <div className="flex items-center bg-gray-100 rounded-lg">
            {/* We will handle remove logic in the full cart view, but simple Add here */}
            <span className="px-3 py-1 font-bold text-primary">
              {quantity} in cart
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-400"></div>
        )}

        <button
          onClick={() => addToCart(product)}
          className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add +
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
