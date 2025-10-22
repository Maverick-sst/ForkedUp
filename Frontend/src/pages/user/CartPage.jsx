// Frontend/src/pages/user/CartPage.jsx
import React from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { IoArrowBack, IoAdd } from "react-icons/io5"; // Using IoAdd for "Add more items"
import { FaEdit, FaHome, FaUser } from "react-icons/fa"; // Using FaEdit for "edit"

function CartPage() {
  const { cartItems, updateItemQuantity, removeItemFromCart, totalAmount } =
    useCart();
  const navigate = useNavigate();

  // Group items by foodPartnerId
  const groupedCartItems = cartItems.reduce((acc, item) => {
    if (!acc[item.foodPartnerId]) {
      acc[item.foodPartnerId] = {
        foodPartnerName: "Restro-name", // Placeholder: You'll fetch this from an API later
        items: [],
      };
    }
    acc[item.foodPartnerId].items.push(item);
    return acc;
  }, {});

  // Handle Checkout button click
  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty! Add some items before checking out.");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-brand-offwhite font-body pb-20">
      {" "}
      {/* pb-20 for fixed bottom button */}
      {/* Top Bar - "cart" title and Back button */}
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 text-brand-gray"
        >
          <IoArrowBack size={24} />
        </button>
        <h1 className="font-heading text-xl text-brand-gray">Cart</h1>
      </div>
      {/* Main Content Area */}
      <div className="p-4 space-y-6">
        {Object.entries(groupedCartItems).length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-10">
            <p className="text-lg text-brand-gray mb-4">Your cart is empty!</p>
            <button
              onClick={() => navigate("/feed")} // Or wherever reels/food list is
              className="px-6 py-2 bg-brand-orange text-white font-heading rounded-lg shadow hover:opacity-90"
            >
              Start Browsing
            </button>
          </div>
        ) : (
          Object.entries(groupedCartItems).map(
            ([foodPartnerId, partnerData]) => (
              <div
                key={foodPartnerId}
                className="bg-white rounded-lg shadow p-4 border border-brand-gray-light"
              >
                {/* Restaurant Header */}
                <div className="flex items-center justify-between mb-4 border-b pb-3 border-brand-gray-light">
                  <Link
                    to={`/food-partner/${foodPartnerId}`}
                    className="flex items-center group"
                  >
                    <IoArrowBack
                      size={20}
                      className="text-brand-gray mr-2 group-hover:text-brand-orange transition-colors"
                    />
                    <h2 className="font-heading text-lg text-brand-gray group-hover:text-brand-orange transition-colors">
                      {partnerData.foodPartnerName}
                    </h2>
                  </Link>
                  {/* Edit button for the whole partner's order, if needed */}
                  {/* <button className="text-sm text-brand-orange flex items-center gap-1">
                                    <FaEdit size={14} /> Edit
                                </button> */}
                </div>

                {/* Items from this partner */}
                <div className="space-y-4">
                  {partnerData.items.map((item) => (
                    <div
                      key={item.foodId}
                      className="flex gap-4 items-center border-b border-brand-gray-light pb-4 last:border-b-0 last:pb-0"
                    >
                      {/* Video Preview / Image Placeholder */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-500 text-xs overflow-hidden">
                        {/* You would typically display an image here: */}
                        {/* <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> */}
                        Video Preview
                      </div>

                      <div className="flex-grow flex flex-col justify-between h-24">
                        <div>
                          <p className="font-semibold text-brand-gray text-base">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            Description of {item.name}. This is a placeholder
                            description.
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-brand-orange">
                            ₹{item.price}
                          </span>
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-brand-peach rounded-full px-2 py-1">
                            <button
                              onClick={() =>
                                updateItemQuantity(
                                  item.foodId,
                                  item.quantity - 1
                                )
                              }
                              className="text-brand-orange text-lg font-bold leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-brand-orange/20 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="text-brand-orange text-base font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItemQuantity(
                                  item.foodId,
                                  item.quantity + 1
                                )
                              }
                              className="text-brand-orange text-lg font-bold leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-brand-orange/20 transition-colors"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Edit button for individual item (optional, per wireframe) */}
                      {/* <button className="text-sm text-brand-gray hover:text-brand-orange transition-colors self-start mt-1">
                                            <FaEdit size={16} />
                                        </button> */}
                    </div>
                  ))}
                </div>

                {/* Add More Items & Note */}
                <div className="mt-4 pt-4 border-t border-brand-gray-light space-y-4">
                  <Link
                    to={`/food-partner/${foodPartnerId}`}
                    className="flex items-center gap-2 text-brand-orange font-semibold hover:underline"
                  >
                    <IoAdd size={20} /> Add more items
                  </Link>
                  <textarea
                    placeholder={`Add a note for ${partnerData.foodPartnerName}...`}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2 bg-brand-offwhite"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            )
          )
        )}
      </div>
      {/* Fixed bottom bar with Checkout button and Total */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-10 left-0 w-full bg-white shadow-lg border-t p-4 flex justify-between items-center z-10">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Total Amount</span>
            <span className="font-semibold text-lg text-brand-orange">
              ₹{totalAmount}
            </span>
          </div>
          <button
            onClick={handleProceedToCheckout}
            className="px-8 py-3 bg-brand-green text-white font-heading rounded-lg shadow hover:opacity-90 transition-opacity"
          >
            Checkout
          </button>
        </div>
      )}
      {/* Bottom nav */}
      <div className="fixed bottom-0 w-full px-8 py-2 flex justify-between items-center bg-white/80 backdrop-blur-md border-t border-gray-200 z-20">
        <Link to="/">
          <FaHome size={24} className="text-black" />
        </Link>
        <Link to="/profile">
          <FaUser size={24} className="text-black" />
        </Link>
      </div>
     </div>
  );
}

export default CartPage;
