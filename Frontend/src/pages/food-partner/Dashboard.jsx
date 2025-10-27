import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaUtensils,
  FaCog,
  FaChartBar,
  FaShippingFast,
} from "react-icons/fa";
import ProgressRing from "../../components/ProgressRing";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import { handleLogout } from "../../utilities/authUtils";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// import { useAuth } from "../../context/AuthContext";
// const { authState } = useAuth();
// --- Onboarding View (Remains the same) ---
const OnboardingView = () => {
  const profileCompletion = 25;
  return (
    <div className="w-full max-w-sm bg-brand-offwhite rounded-2xl shadow-lg p-8 flex flex-col items-center text-center animate-fade-in">
      <p className="text-brand-gray mb-6">
        Complete your profile to start selling
      </p>
      <ProgressRing percentage={profileCompletion} />
      <Link
        to="/food-partner/profile/edit"
        className="mt-8 w-full py-3 px-6 bg-brand-orange text-white font-heading rounded-lg shadow-md hover:bg-brand-peach hover:text-brand-gray transition-colors duration-300"
      >
        Setup Profile
      </Link>
    </div>
  );
};

// --- OPERATIONAL DASHBOARD ---
const OperationalDashboard = () => {
  // ... (State declarations, fetch functions, useEffect hooks, handleUpdateStatus, renderActiveOrderActions remain the same as previous correct version) ...
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isLoadingActive, setIsLoadingActive] = useState(false);
  const [errorOrders, setErrorOrders] = useState(null);
  const navigate = useNavigate();

  const fetchPendingOrders = useCallback(async () => {
    setIsLoadingPending(true);
    console.log("Polling for pending orders...");
    try {
      const response = await axios.get(
        `${apiUrl}/api/orders/partner?status=pending`,
        { withCredentials: true }
      );
      setPendingOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch pending orders:", err);
      setErrorOrders(
        `Could not load new orders. ${err.response?.data?.message || ""}`
      );
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  const fetchActiveOrders = useCallback(async () => {
    setIsLoadingActive(true);
    console.log("Fetching active orders...");
    const activeStatuses = "accepted,preparing,out_for_delivery";
    try {
      const response = await axios.get(
        `${apiUrl}/api/orders/partner?status=${activeStatuses}`,
        { withCredentials: true }
      );
      setActiveOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch active orders:", err);
      setErrorOrders(
        `Could not load active orders. ${err.response?.data?.message || ""}`
      );
    } finally {
      setIsLoadingActive(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingOrders();
    fetchActiveOrders();
    const pendingIntervalId = setInterval(fetchPendingOrders, 20000);
    return () => {
      clearInterval(pendingIntervalId);
    };
  }, [fetchPendingOrders, fetchActiveOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setErrorOrders(null);
    try {
      await axios.patch(
        `${apiUrl}/api/orders/partner/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      console.log(`Order ${orderId} status updated to ${newStatus}`);
      fetchPendingOrders();
      fetchActiveOrders();
    } catch (err) {
      console.error(
        `Failed to update order ${orderId} to status ${newStatus}:`,
        err
      );
      setErrorOrders(
        `Failed to update order status. ${err.response?.data?.message || ""}`
      );
    }
  };

  const renderActiveOrderActions = (order) => {
    switch (order.orderStatus) {
      case "accepted":
        return (
          <button
            onClick={() => handleUpdateStatus(order._id, "preparing")}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <FaUtensils /> Start Preparing
          </button>
        );
      case "preparing":
        return (
          <button
            onClick={() => handleUpdateStatus(order._id, "out_for_delivery")}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-1"
          >
            <FaShippingFast /> Out for Delivery
          </button>
        );
      case "out_for_delivery":
        return (
          <button
            onClick={() => handleUpdateStatus(order._id, "delivered")}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-green rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <FaCheckCircle /> Mark as Delivered
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
      {/* --- RESTAURANT STATUS --- */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Restaurant Status toggle */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl text-brand-gray">
            Restaurant Status
          </h2>
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

        {/* General Error Display */}
        {errorOrders && (
          <p className="text-center text-red-600 py-2 mb-2 border border-red-200 bg-red-50 rounded">
            {errorOrders}
          </p>
        )}

        {/* --- NEW ORDERS SECTION --- */}
        {/* Ensures this section has max-height and scrolling */}
        <div className="border-t border-brand-gray-light pt-4 mb-6">
          <h3 className="font-heading text-lg text-brand-gray mb-2">
            New Orders ({pendingOrders.length})
          </h3>
          {isLoadingPending && (
            <p className="text-center text-gray-500 py-4">
              Checking for new orders...
            </p>
          )}
          {!isLoadingPending && pendingOrders.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              <p>No new orders right now. ✨</p>
            </div>
          )}
          {/* Scrollable container for pending orders */}
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
            {pendingOrders.map((order) => (
              <div
                key={order._id}
                className="border border-brand-gray-light rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                {/* ... Order details ... */}
                {/* Order Header */}
                <div className="flex justify-between items-center mb-2 pb-2 border-b">
                  <div>
                    <p className="text-sm font-semibold text-brand-gray">
                      {order.user?.name || "Customer"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Order ID: ...{order._id.slice(-6)}
                    </p>
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
                      {item.quantity} x {item.food?.name || "Unknown Item"}
                      <span className="text-gray-500">
                        {" "}
                        (₹{(item.price * item.quantity).toFixed(2)})
                      </span>
                    </li>
                  ))}
                </ul>
                {/* Total & Payment */}
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
                {/* Address */}
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

        {/* --- ACTIVE ORDERS SECTION --- */}
        <div className="border-t border-brand-gray-light pt-4">
          <h3 className="font-heading text-lg text-brand-gray mb-2">
            Active Orders ({activeOrders.length})
          </h3>
          {isLoadingActive && (
            <p className="text-center text-gray-500 py-4">
              Loading active orders...
            </p>
          )}
          {!isLoadingActive && activeOrders.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              <p>No orders currently in progress.</p>
            </div>
          )}
          {/* Scrollable container for active orders */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
            {activeOrders.map((order) => (
              <div
                key={order._id}
                className="border border-brand-gray-light rounded-lg p-4 bg-blue-50 shadow-sm"
              >
                {/* ... Order details ... */}
                {/* Order Header (Similar to pending) */}
                <div className="flex justify-between items-center mb-2 pb-2 border-b">
                  <div>
                    <p className="text-sm font-semibold text-brand-gray">
                      {order.user?.name || "Customer"} (ID: ...
                      {order._id.slice(-6)})
                    </p>
                    {/* Display current status clearly */}
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                      {order.orderStatus.replace("_", " ")}
                    </p>
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
                      {item.quantity} x {item.food?.name || "Unknown Item"}
                    </li>
                  ))}
                </ul>
                {/* Address */}
                <p className="text-xs text-gray-600 mb-3 bg-blue-100 p-2 rounded">
                  <span className="font-semibold">Deliver To:</span>{" "}
                  {order.deliveryAddress?.address?.formatted ||
                    "Address details missing"}
                </p>

                {/* Action Buttons for Next Step */}
                <div className="flex justify-end gap-3 mt-3">
                  {renderActiveOrderActions(order)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Today's Snapshot --- */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="font-heading text-xl text-brand-gray mb-4">
          Today's Snapshot 📊
        </h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-brand-green">
              {activeOrders.length}
            </p>
            <p className="text-sm text-brand-gray">Active Orders</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-brand-orange">₹ --</p>
            <p className="text-sm text-brand-gray">Today's Revenue</p>
          </div>
        </div>
      </div>

      {/* --- QUICK ACCESS --- */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <Link
          to="/add-food"
          className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
        >
          <FaUtensils size={24} className="text-brand-orange mb-2" />
          <span className="text-xs font-medium text-brand-gray">
            Manage Menu
          </span>
        </Link>
        <Link
          to="/food-partner/profile/edit"
          className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
        >
          <FaCog size={24} className="text-brand-gray mb-2" />
          <span className="text-xs font-medium text-brand-gray">
            Edit Profile
          </span>
        </Link>
        <button
          className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow disabled:opacity-50"
          disabled
        >
          <FaChartBar size={24} className="text-gray-400 mb-2" />
          <span className="text-xs font-medium text-gray-400">Analytics</span>
        </button>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
function Dashboard() {
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [username, setUsername] = useState("Partner");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const navigate = useNavigate();
  // In Dashboard.jsx, find the fetchProfile useEffect and update it:

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);

      const minLoadingTime = new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );

      try {
        const response = await axios.get(`${apiUrl}/api/me`, {
          withCredentials: true,
        });

        if (response.data?.foodPartner) {
          const partner = response.data.foodPartner;
          setUsername(partner.userName || "Partner");
          const complete = !!(
            partner.name &&
            partner.email &&
            partner.location?.address?.formatted &&
            partner.workingHours?.length > 0
          );
          setIsProfileComplete(complete);
        } else {
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error("Failed to fetch partner profile:", error);
        setIsProfileComplete(false);
      } finally {
        await minLoadingTime;
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Then update the loading component call:
  if (loadingProfile || isProfileComplete === null) {
    return (
      <LoadingComponent message="Loading Dashboard..." minDuration={2000} />
    );
  }
  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite p-6 font-body pb-30 overflow-y-auto scroll-hide">
      {/* Logout Button */}
      <button
        onClick={() => {
          if (window.confirm("Are you sure you want to logout?")) {
            handleLogout(navigate,"foodpartner");
          }
        }}
        className="absolute top-3 right-3 z-30 px-3 py-1 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors flex items-center gap-1 text-xs font-medium"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>

      <h1 className="text-3xl font-heading text-brand-gray mb-8 text-center">
        Hello, {username}!
      </h1>

      <div className="flex flex-col items-center w-full">
        {isProfileComplete ? <OperationalDashboard /> : <OnboardingView />}
      </div>
    </div>
  );
}

export default Dashboard;
