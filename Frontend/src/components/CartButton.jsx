// Frontend/src/components/CartButton.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

// Added positionClass prop for flexibility (e.g., 'fixed bottom-20 right-4')
const CartButton = ({ positionClass = "fixed bottom-24 right-4" }) => {
  // Default position slightly above bottom nav
  const { itemCount } = useCart(); // Get item count from cart context

  // Only render the button if there are items in the cart
  if (itemCount === 0) {
    return null;
  }

  return (
    <Link
      to="/cart"
      className={`${positionClass} z-30 p-3 bg-brand-orange text-white rounded-full shadow-lg hover:bg-brand-peach hover:text-brand-gray transition-colors duration-200 flex items-center justify-center`}
      aria-label={`View cart with ${itemCount} items`}
    >
      <FaShoppingCart size={20} />
      {/* Badge for item count */}
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
        {itemCount}
      </span>
    </Link>
  );
};

export default CartButton;
