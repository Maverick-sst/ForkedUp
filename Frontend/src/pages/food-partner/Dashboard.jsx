import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import ProgressRing from "../../components/ProgressRing";
import axios from "axios";

// ===================================================================================
// 1. ONBOARDING VIEW: Shown to new partners who need to complete their profile.
// ===================================================================================
const OnboardingView = () => {
  const profileCompletion = 25; // Placeholder percentage

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center animate-fade-in">
      <p className="text-brand-gray mb-6">
        Complete your profile to start selling
      </p>

      <ProgressRing percentage={profileCompletion} />

      <Link
        to="/food-partner/profile/edit" // This route will lead to the profile setup form
        className="mt-8 w-full py-3 px-6 bg-brand-orange text-white font-heading rounded-lg shadow-md hover:bg-brand-peach hover:text-brand-gray transition-colors duration-300"
      >
        Setup Profile
      </Link>
    </div>
  );
};

// ===================================================================================
// 2. OPERATIONAL DASHBOARD: The main control center for an active partner.
// ===================================================================================
const OperationalDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]); // State for new orders
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState(null);

  // --- Function to fetch pending orders ---
  const fetchPendingOrders = useCallback(async () => {
    // Avoid fetching if already loading, unless explicitly told to refresh
    // if (isLoadingOrders) return; // Might uncomment this later depending on polling strategy

    setIsLoadingOrders(true);
    setErrorOrders(null);
    console.log("Polling for pending orders..."); // Log polling activity

    try {
      const response = await axios.get(
        "http://localhost:8000/api/orders/partner?status=pending", // Fetch only pending orders
        { withCredentials: true }
      );
      setPendingOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch pending orders:", err);
      setErrorOrders("Could not load new orders. Please try again later.");
      // Keep existing orders in view on error? Or clear them? Depends on UX preference.
      // setPendingOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []); // useCallback ensures this function's identity is stable

  // --- Polling Logic ---
  useEffect(() => {
    // Fetch immediately on component mount
    fetchPendingOrders();

    // Set up the interval for polling (e.g., every 20 seconds)
    const intervalId = setInterval(fetchPendingOrders, 20000); // 20000 ms = 20 seconds

    // Cleanup function: clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [fetchPendingOrders]); // Dependency array includes the fetch function

  // --- Handler for updating order status ---
  const handleUpdateStatus = async (orderId, newStatus) => {
    // Prevent multiple clicks while processing
    // A more robust solution might disable buttons specifically for that order
    // For now, a simple check might suffice if state updates quickly

    try {
      await axios.patch(
        `http://localhost:8000/api/orders/partner/${orderId}/status`,
        { status: newStatus }, // Send the new status in the body
        { withCredentials: true }
      );

      // Optimistically remove the order from the pending list
      setPendingOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
      console.log(`Order ${orderId} status updated to ${newStatus}`);
      // Optionally show a success notification
    } catch (err) {
      console.error(
        `Failed to update order ${orderId} to status ${newStatus}:`,
        err
      );
      setErrorOrders(
        `Failed to update order status. ${err.response?.data?.message || ""}`
      );
      // Optionally show an error notification to the user
    }
    // No finally block to change a global loading state, as actions are per-order
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
      {/* --- Restaurant Status (Immediate Actions) --- */}
      {/* (Restaurant Status section remains largely the same) */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl text-brand-gray">
            Restaurant Status
          </h2>
          {/* (Online/Offline Toggle remains the same) */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              defaultChecked
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
            <span className="ml-3 text-sm font-medium text-brand-gray">
              Online
            </span>
          </label>
        </div>

        {/* --- NEW ORDERS SECTION --- */}
        <div className="border-t border-brand-gray-light pt-4">
          <h3 className="font-heading text-lg text-brand-gray mb-2">
            New Orders ({pendingOrders.length})
          </h3>
          {isLoadingOrders && (
            <p className="text-center text-gray-500 py-4">
              Checking for new orders...
            </p>
          )}
          {errorOrders && (
            <p className="text-center text-red-600 py-4">{errorOrders}</p>
          )}

          {!isLoadingOrders && pendingOrders.length === 0 && !errorOrders && (
            <div className="text-center text-gray-400 py-4">
              <p>No new orders right now. ✨</p>
            </div>
          )}

          {/* List of Pending Orders */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {" "}
            {/* Limit height and add scroll */}
            {pendingOrders.map((order) => (
              <div
                key={order._id}
                className="border border-brand-gray-light rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                {/* Order Header: User + Time */}
                <div className="flex justify-between items-center mb-2 pb-2 border-b">
                  <div>
                    <p className="text-sm font-semibold text-brand-gray">
                      {order.user?.name || "Customer"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Order ID: ...{order._id.slice(-6)}
                    </p>{" "}
                    {/* Short ID */}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Order Items */}
                <ul className="list-disc list-inside space-y-1 text-sm text-brand-gray mb-3">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.quantity} x {item.food?.name || "Unknown Item"}{" "}
                      <span className="text-gray-500">
                        (₹{(item.price * item.quantity).toFixed(2)})
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Order Total & Payment */}
                <div className="text-sm mb-3">
                  <p>
                    <span className="font-semibold">Total:</span> ₹
                    {order.totalAmount.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-semibold">Payment:</span>{" "}
                    {order.paymentDetails.method} ({order.paymentDetails.status}
                    )
                  </p>
                </div>
                {/* Delivery Address */}
                <p className="text-xs text-gray-600 mb-3 bg-gray-100 p-2 rounded">
                  <span className="font-semibold">Deliver To:</span>{" "}
                  {order.deliveryAddress?.address?.formatted ||
                    "Address details missing"}
                </p>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleUpdateStatus(order._id, "rejected")}
                    className="px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                    aria-label={`Reject order ${order._id.slice(-6)}`}
                  >
                    <FaTimesCircle /> Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order._id, "accepted")}
                    className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-green rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                    aria-label={`Accept order ${order._id.slice(-6)}`}
                  >
                    <FaCheckCircle /> Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- AT-A-GLANCE (Snapshot) --- */}
      {/* (This section remains the same) */}
      <div className="bg-white rounded-2xl shadow-lg p-6"> /* ... */ </div>

      {/* --- QUICK ACCESS --- */}
      {/* (This section remains the same) */}
      <div className="grid grid-cols-3 gap-4 text-center"> /* ... */ </div>
    </div>
  );
};

// ===================================================================================
// 3. MAIN DASHBOARD COMPONENT: Decides which view to render.
// ===================================================================================
function Dashboard() {
  // --- Profile Completion Logic ---
  const [isProfileComplete, setIsProfileComplete] = useState(null); // Start as null/loading
  const [username, setUsername] = useState("Partner");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Fetch partner details to check profile status and get username
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await axios.get("http://localhost:8000/api/me", {
          withCredentials: true,
        });
        if (response.data?.foodPartner) {
          const partner = response.data.foodPartner;
          setUsername(partner.userName || "Partner");
          // Define your criteria for a "complete" profile
          const complete = !!(
            partner.name &&
            partner.email &&
            partner.location?.address?.formatted &&
            partner.workingHours?.length > 0
          );
          setIsProfileComplete(complete);
        } else {
          setIsProfileComplete(false); // Assume incomplete if data is missing
        }
      } catch (error) {
        console.error("Failed to fetch partner profile:", error);
        setIsProfileComplete(false); // Assume incomplete on error
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  if (loadingProfile || isProfileComplete === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Dashboard...
      </div>
    ); // Or a proper loading spinner
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-brand-offwhite p-6 font-body">
      <h1 className="text-3xl font-heading text-brand-gray mb-8">
        Hello, {username}!
      </h1>
      {/* Render based on fetched profile completion status */}
      {isProfileComplete ? <OperationalDashboard /> : <OnboardingView />}
    </div>
  );
}

export default Dashboard;
