import { createContext, useState, useContext, useMemo } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // 1. Initialize from LocalStorage so it survives refreshes
    const [restaurantId, setRestaurantIdState] = useState(() => {
        return sessionStorage.getItem('uder_restaurant_id') || null;
    });

    // 2. Helper to set ID and save to storage
    const setRestaurantId = (id) => {
        if (!id) return;
        setRestaurantIdState(id);
        sessionStorage.setItem('uder_restaurant_id', id);
    };

    // Add item to cart
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item._id === product._id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    // Remove item (decrease quantity or remove if 0)
    const removeFromCart = (productId) => {
        setCart((prevCart) => {
            return prevCart.reduce((acc, item) => {
                if (item._id === productId) {
                    if (item.quantity > 1) {
                        acc.push({ ...item, quantity: item.quantity - 1 });
                    }
                    // If quantity is 1, we don't push it (removing it)
                } else {
                    acc.push(item);
                }
                return acc;
            }, []);
        });
    };

    const clearCart = () => setCart([]);

    // Calculate total price automatically
    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            clearCart, 
            cartTotal,
            restaurantId,    // Export the ID
            setRestaurantId  // Export the setter
        }}>
            {children}
        </CartContext.Provider>
    );
};