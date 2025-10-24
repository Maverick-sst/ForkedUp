/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage", error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getInitialCart); // [{ foodId, name, price, quantity, foodPartnerId }, ...]

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const addItemToCart = (item) => {
    // Basic validation for the item being added
    if (
      !item ||
      !item.foodId ||
      typeof item.price !== "number" ||
      !item.foodPartner
    ) {
      console.error("Attempted to add invalid item to cart:", item);
      return; // Prevent adding invalid items
    }

    setCartItems((prevItems) => {
      // Check if the cart is not empty and the new item is from a different partner
      if (
        prevItems.length > 0 &&
        prevItems[0].foodPartnerId !== item.foodPartner
      ) {
        //  Cart is not empty AND new item is from a different partner
        console.log(
          "Adding item from a different partner. Clearing existing cart."
        );

        return [
          {
            foodId: item.foodId,
            name: item.name,
            price: item.price,
            foodPartnerId: item.foodPartner,
            videoUrl: item.videoUrl,
            quantity: 1,
          },
        ];
      } else {
        // Cart is empty OR new item is from the SAME partner

        const existingItemIndex = prevItems.findIndex(
          (cartItem) => cartItem.foodId === item.foodId
        );

        if (existingItemIndex > -1) {
          // Item exists, increase quantity
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
          };
          return updatedItems;
        } else {
          // Add new item to the existing cart (or start a new cart if empty)
          return [
            ...prevItems,
            {
              foodId: item.foodId,
              name: item.name,
              price: item.price,
              foodPartnerId: item.foodPartner,
              videoUrl: item.videoUrl,
              quantity: 1,
            },
          ];
        }
      }
    });
    console.log("Added to cart:", item);
  };

  // Ensure totalAmount calculation handles potential issues gracefully
  const totalAmount = cartItems.reduce((total, item) => {
    // Make sure price and quantity are valid numbers before adding
    const price = typeof item.price === "number" ? item.price : 0;
    const quantity = typeof item.quantity === "number" ? item.quantity : 0;
    return total + price * quantity;
  }, 0);

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

  const removeItemFromCart = (foodId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.foodId !== foodId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  const value = {
    cartItems,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart,
    itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to easily use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
