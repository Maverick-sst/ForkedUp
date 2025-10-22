/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the context
const CartContext = createContext();

// Helper function to get initial cart from localStorage
const getInitialCart = () => {
    try {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        return [];
    }
};

// 2. Create the Provider component
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(getInitialCart); // [{ foodId, name, price, quantity, foodPartnerId }, ...]

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, [cartItems]);

    // Function to add an item
    const addItemToCart = (item) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((cartItem) => cartItem.foodId === item.foodId);
            if (existingItem) {
                // Increase quantity if item already exists
                return prevItems.map((cartItem) =>
                    cartItem.foodId === item.foodId
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                // Add new item with quantity 1
                // Ensure we only add necessary fields
                return [...prevItems, {
                    foodId: item._id, // Assuming item has _id
                    name: item.name,
                    price: item.price,
                    foodPartnerId: item.foodPartner, // Assuming item has foodPartner
                    quantity: 1
                }];
            }
        });
        console.log("Added to cart:", item); // For debugging
    };

    // Function to update quantity
    const updateItemQuantity = (foodId, newQuantity) => {
        setCartItems((prevItems) => {
            if (newQuantity <= 0) {
                // Remove item if quantity is 0 or less
                return prevItems.filter((item) => item.foodId !== foodId);
            }
            return prevItems.map((item) =>
                item.foodId === foodId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    // Function to remove an item completely
    const removeItemFromCart = (foodId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.foodId !== foodId));
    };

    // Function to clear the entire cart
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems'); // Clear storage too
    };

     // Calculate total amount
     const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // 3. Value provided to consuming components
    const value = {
        cartItems,
        addItemToCart,
        updateItemQuantity,
        removeItemFromCart,
        clearCart,
        itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
        totalAmount
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 4. Custom hook to easily use the cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Export the context itself if needed elsewhere (less common)
// export default CartContext;