import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { IoArrowBack, IoAdd } from "react-icons/io5";
import { FaEdit, FaVideoSlash } from "react-icons/fa";
import BottomNav from "../../components/BottomNav";
import { useNotification } from "../../components/Notification";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function CartPage() {
  const { cartItems, updateItemQuantity, totalAmount } = useCart();
  const navigate = useNavigate();
  const {showNotification} = useNotification();
  const [partnerDetailsMap, setPartnerDetailsMap] = useState({});
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      if (cartItems.length === 0) {
        setPartnerDetailsMap({});
        return;
      }
      const partnerIdsInCart = [
        ...new Set(cartItems.map((item) => item.foodPartnerId)),
      ];
      const idsToFetch = partnerIdsInCart.filter(
        (id) => id && !partnerDetailsMap[id]
      );

      if (idsToFetch.length === 0) return;

      setIsLoadingPartners(true);
      try {
        const partnerPromises = idsToFetch.map((id) =>
          axios
            .get(`${apiUrl}/api/food-partner/${id}`, {
              withCredentials: true,
            })
            .then((res) => ({
              id,
              name: res.data?.foodPartner?.name || "Restaurant Unavailable",
            }))
            .catch((err) => {
              console.error(`Failed to fetch partner ${id}:`, err);
              return { id, name: "Restaurant Error" };
            })
        );
        const results = await Promise.all(partnerPromises);
        setPartnerDetailsMap((prevMap) => {
          const newMap = { ...prevMap };
          results.forEach((partner) => {
            newMap[partner.id] = { name: partner.name };
          });
          return newMap;
        });
      } catch (error) {
        console.error("Error fetching partner details:", error);
      } finally {
        setIsLoadingPartners(false);
      }
    };
    fetchPartnerDetails();
  }, [cartItems]);

  const groupedCartItems = cartItems.reduce((acc, item) => {
    const partnerId = item.foodPartnerId;
    if (!partnerId) return acc;
    if (!acc[partnerId]) {
      acc[partnerId] = {
        foodPartnerName:
          partnerDetailsMap[partnerId]?.name ||
          (isLoadingPartners ? "Loading..." : "Restaurant"),
        items: [],
      };
    }
    // *** Ensure item price is valid before adding to group ***
    if (typeof item.price === "number") {
      acc[partnerId].items.push(item);
    } else {
      console.warn("Skipping item with invalid price:", item);
    }
    return acc;
  }, {});

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      // alert("Your cart is empty!");
      showNotification("Your cart is empty!");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="flex flex-col h-full bg-brand-offwhite font-body">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20 p-4 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 text-brand-gray"
        >
          <IoArrowBack size={24} />
        </button>
        <h1 className="font-heading text-xl text-brand-gray">Cart</h1>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-32 scrollbar-hide">
        {Object.keys(groupedCartItems).length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-10">
            <p className="text-lg text-brand-gray mb-4">Your cart is empty!</p>
            <button
              onClick={() => navigate("/feed")}
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
                  <button className="text-sm text-brand-orange flex items-center gap-1">
                    <FaEdit size={14} /> Edit
                  </button>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {partnerData.items.map((item) => (
                    <div
                      key={item.foodId}
                      className="flex gap-4 items-center border-b border-brand-gray-light pb-4 last:border-b-0 last:pb-0"
                    >
                      {/* Video Preview */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-500">
                        <FaVideoSlash size={24} />
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow flex flex-col justify-between min-h-[6rem]">
                        <div>
                          <p className="font-semibold text-brand-gray text-base">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-brand-orange">
                            {/* Ensure price is a number before formatting */}₹
                            {typeof item.price === "number"
                              ? item.price.toFixed(2)
                              : "N/A"}
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
                      {/* Optional Edit button */}
                      <button className="text-sm text-brand-gray hover:text-brand-orange transition-colors self-start mt-1">
                        <FaEdit size={16} />
                      </button>
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

      {/* Checkout Footer */}
      {cartItems.length > 0 && (
        <div className="absolute bottom-10 left-0 w-full max-w-[450px] mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t p-4 flex justify-between items-center z-10">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Total Amount</span>
            <span className="font-semibold text-lg text-brand-orange">
              {/* Ensure totalAmount is a number before formatting */}₹
              {typeof totalAmount === "number"
                ? totalAmount.toFixed(2)
                : "0.00"}
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
      <BottomNav />
    </div>
  );
}

export default CartPage;
