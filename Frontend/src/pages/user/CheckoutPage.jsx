import { useState, useEffect, useCallback } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import {
  FaMapMarkerAlt,
  FaRegAddressCard,
  FaCreditCard,
  FaSave,
  FaCrosshairs,
  FaSpinner,
} from "react-icons/fa";
import { useGeoLocation } from "../../hooks/useGeoLocation";
import { useNotification } from "../../components/Notification";
import LoadingComponent from "../../components/LoadingComponent";
export default function CheckoutPage() {
  const { cartItems, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isUsingManualAddress, setIsUsingManualAddress] = useState(true);
  const [manualFormattedAddress, setManualFormattedAddress] = useState("");
  const [manualStreet, setManualStreet] = useState("");
  const [manualBlock, setManualBlock] = useState("");
  const [manualBuilding, setManualBuilding] = useState("");
  const [manualFloor, setManualFloor] = useState("");
  const [manualLandmark, setManualLandmark] = useState("");
  const [newAddressLabel, setNewAddressLabel] = useState("other");
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderJustPlaced, setOrderJustPlaced] = useState(false);
  const [showUpiSimulationModal, setShowUpiSimulationModal] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const { location, status: geoStatus, requestLocation } = useGeoLocation();
  const [isFetchingGeoAddress, setIsFetchingGeoAddress] = useState(false);
  const { showNotification } = useNotification();
  useEffect(() => {
    const fetchUserDetailsAndLocalStorage = async () => {
      const minLoadingTime = new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );
      setIsLoading(true);
      setErrorMessage("");
      let fetchedAddresses = [];
      let defaultAddressIndex = 0;
      let useManual = true;

      try {
        const response = await axios.get("http://localhost:8000/api/me", {
          withCredentials: true,
        });
        if (response.data?.user?.addresses?.length > 0) {
          fetchedAddresses = response.data.user.addresses;
          defaultAddressIndex = response.data.user.defaultAddress || 0;
          if (
            defaultAddressIndex >= fetchedAddresses.length ||
            defaultAddressIndex < 0
          ) {
            defaultAddressIndex = 0;
          }
          setUserAddresses(fetchedAddresses);
          setSelectedAddressIndex(defaultAddressIndex);
          useManual = false;
        } else {
          setUserAddresses([]);
          useManual = true;
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        useManual = true;
      }

      setIsUsingManualAddress(useManual);

      // Pre-fill manual formatted address from local storage ONLY if using manual mode initially
      if (useManual) {
        const storedAddress = localStorage.getItem("userAddress");
        if (storedAddress && !manualFormattedAddress) {
          setManualFormattedAddress(storedAddress);
        }
      }
      await minLoadingTime;
      setIsLoading(false);
    };

    if (cartItems.length === 0 && !isLoading) {
      navigate("/cart", { replace: true });
      return;
    }

    fetchUserDetailsAndLocalStorage();
    // Intentionally excluding cartItems, isLoading, navigate, manualFormattedAddress from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Effect to handle navigation if cart becomes empty after initial load
  // but NOT immediately after placing an order.
  useEffect(() => {
    // Only redirect if loading is finished, cart is empty, AND an order wasn't just placed
    if (!isLoading && cartItems.length === 0 && !orderJustPlaced) {
      console.log(
        "Cart is empty and order not just placed, navigating back to cart."
      );
      navigate("/cart", { replace: true });
    }
    // If orderJustPlaced was true, this effect does nothing, allowing the /order-success navigation to proceed.
  }, [cartItems, isLoading, navigate, orderJustPlaced]);

  // --- Effect to fetch formatted address when location updates ---
  useEffect(() => {
    if (location && geoStatus === "ready" && isFetchingGeoAddress) {
      // Only fetch if we triggered it
      const fetchFormattedAddress = async () => {
        setErrorMessage(""); // Clear previous errors
        try {
          const response = await axios.get(
            `http://localhost:8000/api/location/reverse-geocode?lat=${location.lat}&lng=${location.lng}`
          );
          const formattedAddress = response.data.address;
          if (formattedAddress) {
            setManualFormattedAddress(formattedAddress); // Update the state
            // Also clear other manual fields if desired when auto-filling
            setManualStreet("");
            setManualBlock("");
            setManualBuilding("");
            setManualFloor("");
            setManualLandmark("");
          } else {
            setErrorMessage("Could not find address for current location.");
          }
        } catch (error) {
          console.error("Error fetching formatted address:", error);
          setErrorMessage(
            error.response?.data?.message ||
              "Failed to fetch address for current location."
          );
        } finally {
          setIsFetchingGeoAddress(false); // Reset fetching trigger
        }
      };
      fetchFormattedAddress();
    } else if (
      geoStatus === "denied" ||
      geoStatus === "error" ||
      geoStatus === "unsupported"
    ) {
      if (isFetchingGeoAddress) {
        setErrorMessage(
          `Could not get location: ${geoStatus}. Please enable permissions or enter manually.`
        );
        setIsFetchingGeoAddress(false); // Reset trigger even on error
      }
    }
  }, [location, geoStatus, isFetchingGeoAddress]);

  const handleRequestLocationClick = useCallback(() => {
    setIsFetchingGeoAddress(true);
    setErrorMessage("");
    requestLocation();
  }, [requestLocation]);

  const getFinalDeliveryLocationObject = () => {
    if (!isUsingManualAddress && userAddresses.length > selectedAddressIndex) {
      return userAddresses[selectedAddressIndex].location;
    } else if (isUsingManualAddress) {
      const formatted =
        manualFormattedAddress.trim() ||
        `${manualBuilding}, ${manualFloor}, ${manualStreet}, ${manualBlock}${
          manualLandmark ? ", near " + manualLandmark : ""
        }`
          .replace(/, ,/g, ",")
          .replace(/^, |, $/g, "")
          .replace(/ ,/g, ",")
          .trim();

      if (
        !formatted &&
        !manualStreet.trim() &&
        !manualBlock.trim() &&
        !manualBuilding.trim()
      ) {
        setErrorMessage(
          "Please provide address details (Formatted Address or Street/Block/Building)."
        );
        return null;
      }

      return {
        type: "Point",
        address: {
          formatted: formatted || undefined,
          street: manualStreet.trim() || undefined,
          block: manualBlock.trim() || undefined,
          building: manualBuilding.trim() || undefined,
          floor: manualFloor.trim() || undefined,
          landmark: manualLandmark.trim() || undefined,
        },
      };
    }
    return null;
  };

  const handlePlaceOrder = async () => {
    // Keep existing validation for address and cart items
    setIsPlacingOrder(true); // Set loading early
    setErrorMessage("");
    const finalLocationObject = getFinalDeliveryLocationObject();

    if (!finalLocationObject) {
      // Error message is set within getFinalDeliveryLocationObject
      setIsPlacingOrder(false); // Reset loading state
      return;
    }
    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty.");
      setIsPlacingOrder(false); // Reset loading state
      return;
    }

    // *** START UPI SIMULATION CHECK ***
    if (paymentMethod === "UPI") {
      setShowUpiSimulationModal(true); // Show the modal
      setIsPlacingOrder(false); // Don't keep main button loading while modal is shown
      return; // Stop here, wait for modal interaction
    }
    // *** END UPI SIMULATION CHECK ***

    // If not UPI, proceed directly with "pending" status
    proceedWithOrderPlacement("pending");
  };

  // New function to handle the actual order placement
  const proceedWithOrderPlacement = async (paymentStatus) => {
    setIsPlacingOrder(true); // Ensure loading state is active
    setErrorMessage("");
    setShowUpiSimulationModal(false); // Close modal if it was open

    // Re-get location object just in case, though it should be available
    const finalLocationObject = getFinalDeliveryLocationObject();
    if (!finalLocationObject) {
      // This check might be redundant if handlePlaceOrder already validated, but good for safety
      setIsPlacingOrder(false);
      return;
    }

    // Save address logic (keep your existing logic)
    if (isUsingManualAddress && saveNewAddress) {
      try {
        await axios.patch(
          "http://localhost:8000/api/user/addresses",
          { label: newAddressLabel, location: finalLocationObject },
          { withCredentials: true }
        );
        // You might want to refetch addresses here or update state if needed
      } catch (error) {
        console.error("Failed to save new address:", error);
        setErrorMessage(
          `Could not save new address: ${
            error.response?.data?.message || error.message
          }. Order not placed.`
        );
        setIsPlacingOrder(false);
        return; // Stop order placement if saving address failed
      }
    }

    // Prepare order payload
    const orderPayload = {
      items: cartItems.map((item) => ({
        food: item.foodId,
        quantity: item.quantity,
        price: item.price, // Ensure price is validated before adding to cart
      })),
      totalAmount: totalAmount,
      deliveryAddress: finalLocationObject, // Use the final validated/selected address object
      paymentDetails: { method: paymentMethod, status: paymentStatus }, // Use the determined status
      foodPartner: cartItems.length > 0 ? cartItems[0].foodPartnerId : null, // Ensure you have foodPartnerId in cart items
    };

    // Check for essential payload parts
    if (!orderPayload.foodPartner) {
      setErrorMessage(
        "Cannot place order - missing restaurant information in cart."
      );
      setIsPlacingOrder(false);
      return;
    }
    if (!orderPayload.deliveryAddress) {
      setErrorMessage("Cannot place order - delivery address is missing.");
      setIsPlacingOrder(false);
      return;
    }

    // Place Order API call (keep your existing logic)
    try {
      console.log("Sending order payload:", orderPayload); // Log payload before sending
      const orderResponse = await axios.post(
        "http://localhost:8000/api/orders",
        orderPayload,
        { withCredentials: true }
      );
      console.log("Order placed successfully:", orderResponse.data);
      const newOrderId = orderResponse.data.order?._id;

      if (newOrderId) {
        setOrderJustPlaced(true); // Set flag before navigating
        // clearCart(); // Clear cart AFTER successful navigation setup
        navigate(`/order-success/${newOrderId}`);
        // Clear cart needs to happen *after* navigation starts or in a useEffect triggered by navigation
        // For simplicity, let's clear it just before navigation for now, but be aware of potential race conditions if navigation fails
        clearCart();
      } else {
        console.error("Order created but ID missing in response");
        setOrderJustPlaced(true);
        clearCart(); // Still clear cart
        navigate("/"); // Fallback navigation
      }
    } catch (error) {
      console.error(
        "Order placement failed:",
        error.response?.data || error.message || error
      );
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to place order. Please try again."
      );
      // Do NOT clear cart on error
    } finally {
      setIsPlacingOrder(false); // Reset loading state
      setIsSimulatingPayment(false); // Ensure simulation spinner stops
    }
  };
  // Handlers for the simulation modal buttons
  const handleUpiSimulationResult = (success) => {
    setShowUpiSimulationModal(false); // Hide modal first
    if (success) {
      showNotification("Simulated UPI Payment Successful!", "success");
      // Set a brief visual indicator
      setIsSimulatingPayment(true);
      setTimeout(() => {
        // proceedWithOrderPlacement takes the calculated paymentStatus
        proceedWithOrderPlacement("completed"); // Call the actual placement function with 'completed' status
        // setIsSimulatingPayment(false); // This will be reset in proceedWithOrderPlacement's finally block
      }, 500); // Short delay for visual feedback
    } else {
      showNotification(
        "Simulated UPI Payment Failed. Order not placed.",
        "error"
      );
      setIsPlacingOrder(false); // Ensure the main button is re-enabled if needed
    }
  };
  if (isLoading) {
    return (
      <LoadingComponent message="Loading Checkout..." minDuration={1500} />
    );
  }

  return (
    <div className="flex flex-col h-full bg-brand-offwhite font-body">
      {/* Header - Sticky */}
      <div className="bg-white shadow-sm sticky top-0 z-20 p-4 flex items-center flex-shrink-0">
        <button
          onClick={() => navigate("/cart")}
          className="text-brand-gray mr-4"
        >
          <IoArrowBack size={24} />
        </button>
        <h1 className="font-heading text-xl text-brand-gray flex-grow text-center pr-8">
          Checkout
        </h1>{" "}
        {/* Centered title */}
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-20 scrollbar-hide">
        {/* Map Placeholder (Keep as is) */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <h2 className="font-heading text-lg text-brand-gray mb-3 self-start flex items-center gap-2">
            <FaMapMarkerAlt /> Delivery Location
          </h2>
          <div className="w-32 h-32 md:w-40 md:h-40 bg-green-100 border-2 border-dashed border-green-400 rounded-full flex items-center justify-center text-center text-green-700 text-xs md:text-sm p-4">
            Map Placeholder
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-heading text-lg text-brand-gray mb-3 flex items-center gap-2">
            <FaRegAddressCard /> Delivery Address
          </h2>
          {/* Display general error messages here */}
          {errorMessage && (
            <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
          )}

          {/* Radio buttons (Keep as is) */}
          <div className="flex gap-4 mb-4">
            {userAddresses.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  checked={!isUsingManualAddress}
                  onChange={() => setIsUsingManualAddress(false)}
                  className="text-brand-orange focus:ring-brand-orange focus:ring-1"
                />
                <span className="text-sm text-brand-gray">Use Saved</span>
              </label>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="addressType"
                checked={isUsingManualAddress}
                onChange={() => setIsUsingManualAddress(true)}
                className="text-brand-orange focus:ring-brand-orange focus:ring-1"
              />
              <span className="text-sm text-brand-gray">Enter New</span>
            </label>
          </div>

          {/* Saved Address Selector (Keep as is) */}
          {!isUsingManualAddress && userAddresses.length > 0 && (
            <select
              value={selectedAddressIndex}
              onChange={(e) =>
                setSelectedAddressIndex(parseInt(e.target.value, 10))
              }
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2 mb-2"
            >
              {userAddresses.map((addr, index) => (
                <option key={addr._id || index} value={index}>
                  {addr.label.toUpperCase()} -{" "}
                  {addr.location?.address?.formatted || "Address Incomplete"}
                </option>
              ))}
            </select>
          )}

          {/* Manual Address Input Fields */}
          {isUsingManualAddress && (
            <div className="space-y-2 border-t pt-3 mt-3">
              <h3 className="text-md font-semibold text-brand-gray mb-2">
                {" "}
                {/* Increased margin */}
                Enter New Address Details:
              </h3>
              <div className="relative mb-2">
                {" "}
                {/* Added margin bottom */}
                <label htmlFor="manualFormattedAddress" className="sr-only">
                  Formatted Address
                </label>
                <textarea
                  id="manualFormattedAddress"
                  placeholder="Full Address (e.g., House No, Street, Area)"
                  value={manualFormattedAddress}
                  onChange={(e) => setManualFormattedAddress(e.target.value)}
                  rows="2"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2 pr-10 resize-none" // Added resize-none
                />
                <button
                  type="button"
                  onClick={handleRequestLocationClick}
                  disabled={geoStatus === "loading" || isFetchingGeoAddress} // Disable while loading
                  className="absolute top-2 right-2 p-1 text-brand-gray hover:text-brand-orange disabled:text-gray-400 disabled:cursor-wait"
                  aria-label="Use current location"
                >
                  {geoStatus === "loading" || isFetchingGeoAddress ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <FaCrosshairs size={18} />
                  )}
                </button>
              </div>

              {(geoStatus === "loading" || isFetchingGeoAddress) && (
                <p className="text-xs text-blue-600 mb-2">
                  Fetching location...
                </p>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={manualStreet}
                  onChange={(e) => setManualStreet(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2 mb-2"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Block / Sector"
                    value={manualBlock}
                    onChange={(e) => setManualBlock(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2"
                  />
                  <input
                    type="text"
                    placeholder="Building Name"
                    value={manualBuilding}
                    onChange={(e) => setManualBuilding(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Floor / Apt No."
                    value={manualFloor}
                    onChange={(e) => setManualFloor(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={manualLandmark}
                    onChange={(e) => setManualLandmark(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2"
                  />
                </div>
              </div>

              {/* Address Label & Save Checkbox (Keep as is) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-brand-gray">
                    Label as:
                  </span>
                  {["home", "work", "other"].map((label) => (
                    <label
                      key={label}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="addressLabel"
                        value={label}
                        checked={newAddressLabel === label}
                        onChange={() => setNewAddressLabel(label)}
                        className="text-brand-orange focus:ring-brand-orange focus:ring-1"
                      />
                      <span className="text-sm capitalize">{label}</span>
                    </label>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-2 sm:mt-0">
                  <input
                    type="checkbox"
                    checked={saveNewAddress}
                    onChange={(e) => setSaveNewAddress(e.target.checked)}
                    className="rounded text-brand-orange focus:ring-brand-orange focus:ring-1"
                  />
                  <span className="text-sm text-brand-gray">Save address</span>
                  <FaSave className="text-brand-gray" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Section (Keep as is) */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-heading text-lg text-brand-gray mb-3 flex items-center gap-2">
            <FaCreditCard /> Payment Method
          </h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="Cash on Delivery"
                checked={paymentMethod === "Cash on Delivery"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-brand-orange focus:ring-brand-orange focus:ring-1"
              />
              <span className="text-sm text-brand-gray">Cash on Delivery</span>
            </label>
            <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="UPI"
                checked={paymentMethod === "UPI"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-brand-orange focus:ring-brand-orange focus:ring-1"
              />
              <span className="text-sm text-brand-gray">UPI</span>
            </label>
            <label className="flex items-center gap-2 p-2 border rounded-lg text-gray-400 cursor-not-allowed">
              <input
                type="radio"
                name="paymentMethod"
                value="Card"
                disabled
                className="text-brand-orange focus:ring-brand-orange focus:ring-1"
              />
              <span className="text-sm">Card (Coming Soon)</span>
            </label>
          </div>
        </div>
      </div>

      {/* ... Other sections like Payment Method ... */}

      {/* UPI Simulation Modal */}
      {showUpiSimulationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="font-heading text-lg text-brand-gray mb-4">
              Simulate UPI Payment
            </h3>
            {/* You could add a placeholder QR code image here if desired */}
            {/* <img src="/path/to/dummy-qr.png" alt="Simulated QR Code" className="mx-auto mb-4 w-32 h-32"/> */}
            <p className="text-sm text-brand-gray mb-6">
              This is a test simulation. Choose the outcome:
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleUpiSimulationResult(true)}
                className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Success
              </button>
              <button
                onClick={() => handleUpiSimulationResult(false)}
                className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Failure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional: Visual feedback during brief simulation delay */}
      {isSimulatingPayment && (
        <div className="fixed inset-0 bg-white/70 z-40 flex items-center justify-center">
          <FaSpinner className="animate-spin text-brand-orange text-4xl" />
          <p className="ml-3 text-brand-gray">Processing Payment...</p>
        </div>
      )}

      {/* Checkout Footer (This part should already exist, update the button inside it) */}
      <div className="absolute bottom-0 left-0 w-full max-w-[450px] mx-auto bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t p-3 z-10 flex-shrink-0">
        <button
          onClick={handlePlaceOrder} // Keep this onClick
          disabled={isPlacingOrder || isLoading || isSimulatingPayment} // Update disabled condition
          className={`w-full py-3 px-6 text-white font-heading rounded-lg shadow transition-opacity ${
            isPlacingOrder || isLoading || isSimulatingPayment // Update class condition
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-brand-green hover:opacity-90"
          }`}
        >
          {/* Update button text */}
          {isPlacingOrder || isSimulatingPayment
            ? "Processing..."
            : `Place Order (₹${
                typeof totalAmount === "number"
                  ? totalAmount.toFixed(2)
                  : "0.00"
              })`}
        </button>
      </div>
    </div> // This should be the closing tag for the main component div
  );
}
