import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent";
import RatingPopup from "../../components/RatingPopup"; 
import { useNotification } from "../../components/Notification";
import {
  FaClipboardCheck,
  FaRegClock,
  FaCheckCircle,
  FaShippingFast,
  FaHome,
  FaBoxOpen,
  FaTimesCircle,
  FaUtensils,
  // FaStar and FaTimes removed from here
} from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getStatusDetails = (status) => {
  switch (status) {
    case "pending":
      return {
        text: "Waiting for partner to accept...",
        icon: FaRegClock,
        color: "text-yellow-500",
        step: 1,
      };
    case "accepted":
      return {
        text: "Partner accepted your order!",
        icon: FaCheckCircle,
        color: "text-blue-500",
        step: 2,
      };
    case "preparing":
      return {
        text: "Your food is being prepared...",
        icon: FaUtensils,
        color: "text-blue-500",
        step: 2,
      };
    case "ready_for_pickup":
      return {
        text: "Ready for pickup",
        icon: FaBoxOpen,
        color: "text-purple-500",
        step: 3,
      };
    case "out_for_delivery":
      return {
        text: "Out for delivery!",
        icon: FaShippingFast,
        color: "text-purple-500",
        step: 3,
      };
    case "delivered":
      return {
        text: "Order Delivered!",
        icon: FaHome,
        color: "text-green-500",
        step: 4,
      };
    case "rejected":
      return {
        text: "Order Rejected by Partner",
        icon: FaTimesCircle,
        color: "text-red-500",
        step: -1,
      };
    case "cancelled":
      return {
        text: "Order Cancelled",
        icon: FaTimesCircle,
        color: "text-red-500",
        step: -1,
      };
    default:
      return {
        text: "Status Unknown",
        icon: FaRegClock,
        color: "text-gray-500",
        step: 0,
      };
  }
};

const OrderStatusStep = ({ stepStatus, currentStep }) => {
  const isActive = stepStatus.step > 0 && currentStep >= stepStatus.step;
  const isFinalRejectedCancelled = stepStatus.step === -1 && currentStep === -1;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isActive || isFinalRejectedCancelled
          ? `${stepStatus.color
              .replace("text-", "bg-")
              .replace("-500", "-100")}`
          : "bg-gray-100"
      }`}
    >
      <div
        className={`p-2 rounded-full ${
          isActive || isFinalRejectedCancelled
            ? `${stepStatus.color.replace("text-", "bg-")}`
            : "bg-gray-300"
        }`}
      >
        <stepStatus.icon
          className={
            isActive || isFinalRejectedCancelled
              ? "text-white"
              : "text-gray-500"
          }
          size={16}
        />
      </div>
      <span
        className={`text-sm font-medium ${
          isActive || isFinalRejectedCancelled
            ? stepStatus.color
            : "text-gray-500"
        }`}
      >
        {stepStatus.text}
      </span>
    </div>
  );
};

// --- RATING POPUP COMPONENT REMOVED FROM HERE ---

function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const {showNotification} = useNotification();
  // --- State for Rating ---
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [hasRated, setHasRated] = useState(false); // Prevents re-showing
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState(null);
  // ----------------------------

  const fetchOrderDetails = useCallback(
    async (isInitialLoad = false) => {
      const minLoadingTime = new Promise((resolve) =>
        setTimeout(resolve, 2500)
      );
      if (isInitialLoad) {
        setIsLoading(true);
      }
      setError(null);
      console.log(
        `${
          isInitialLoad ? "Fetching initial" : "Polling for"
        } order ${orderId} status...`
      );

      if (!orderId) {
        setError("No order ID provided.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${apiUrl}/api/orders/${orderId}`,
          { withCredentials: true }
        );
        setOrder(response.data.order || null);
      } catch (err) {
        console.error("Failed to fetch order details:", err);

        setError(
          err.response?.data?.message ||
            "Could not load order details. Retrying..."
        );
      } finally {
        if (isInitialLoad) {
          await minLoadingTime;
          setIsLoading(false);
        }
      }
    },
    [orderId]
  );

  useEffect(() => {
    console.log("OrderSuccessPage mounted. Fetching initial details...");
    fetchOrderDetails(true); // Call fetch with isInitialLoad = true
  }, [fetchOrderDetails]);

  const isFinalStatus =
    order?.orderStatus === "delivered" ||
    order?.orderStatus === "rejected" ||
    order?.orderStatus === "cancelled";

  //Polling Logic
  useEffect(() => {
    if (!isLoading && !isFinalStatus) {
      setIsPolling(true);
      console.log("Polling started...");
      const intervalId = setInterval(() => {
        fetchOrderDetails(false);
      }, 15000);

      return () => {
        clearInterval(intervalId);
        setIsPolling(false);
        console.log("Polling stopped.");
      };
    } else if (isFinalStatus) {
      setIsPolling(false);
      console.log("Order reached final state, ensuring polling stops.");
    }
  }, [isLoading, isFinalStatus, fetchOrderDetails]);

  // --- Effect to Show Rating Popup ---
  useEffect(() => {
    if (order?.orderStatus === "delivered" && !hasRated) {
      const timer = setTimeout(() => {
        setShowRatingPopup(true);
      }, 2000); // Wait 2s after delivery to show

      return () => clearTimeout(timer);
    }
  }, [order?.orderStatus, hasRated]);

  // --- Handler for Rating Submission ---
  const handleRatingSubmit = async (rating, comment) => {
    setIsSubmittingRating(true);
    setRatingError(null);
    try {
      const partnerId = order?.foodPartner?._id;
      if (!partnerId) {
        throw new Error("Food partner ID not found on the order.");
      }

      await axios.post(
        `${apiUrl}/api/ratings/${partnerId}`,
        { rating, comment },
        { withCredentials: true }
      );

      // Success
      setShowRatingPopup(false);
      setHasRated(true); // Mark as rated to prevent re-showing
      // alert("Thank you for your rating!"); // Simple success feedback
      showNotification("Thank you for your rating!")
    } catch (err) {
      console.error("Failed to submit rating:", err);
      setRatingError(
        err.response?.data?.message ||
          "Could not submit rating. Please try again."
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingComponent message="Loading Order Details..." minDuration={2500} />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <h1 className="font-heading text-2xl text-brand-gray font-bold text-red-600 mb-4">
          Error
        </h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-brand-orange text-white rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <h1 className="font-heading text-2xl text-brand-gray font-bold text-brand-gray mb-4">
          Order Not Found
        </h1>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-brand-orange text-white rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  const currentStatusDetails = getStatusDetails(order.orderStatus);
  const orderSteps = [
    getStatusDetails("pending"),
    getStatusDetails("accepted"),
    getStatusDetails("out_for_delivery"),
    getStatusDetails("delivered"),
  ];

  const displaySteps =
    currentStatusDetails.step === -1 ? [currentStatusDetails] : orderSteps;

  return (
    <div className="flex flex-col h-screen bg-brand-offwhite font-body overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center justify-center">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 text-brand-gray"
        >
          <IoArrowBack size={24} />
        </button>
        <h1 className="font-heading text-xl text-brand-gray">Order Tracking</h1>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto scrollbar-hide p-4 space-y-5">
        {/* Initial Success Message */}
        {order.orderStatus === "pending" && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-center shadow animate-fade-in mb-5">
            <FaClipboardCheck className="inline-block mr-2" size={20} />
            <span className="font-semibold">Order Placed Successfully!</span>
            <p className="text-sm">Order ID: ...{order._id.slice(-6)}</p>
          </div>
        )}

        {/* Order Status Visualizer */}
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          <h2 className="font-heading text-lg text-brand-gray mb-3 border-b pb-2">
            Order Status
          </h2>
          {displaySteps.map((stepStatus, index) => (
            <OrderStatusStep
              key={index}
              stepStatus={stepStatus}
              currentStep={currentStatusDetails.step}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-heading text-lg text-brand-gray mb-3 border-b pb-2">
            Order Summary
          </h2>
          <p className="text-sm text-brand-gray mb-1">
            <span className="font-semibold">Restaurant:</span>{" "}
            {order.foodPartner?.name || "N/A"}
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-brand-gray mb-2 pl-4">
            {order.items.map((item, index) => (
              <li key={index}>
                {item.quantity} x {item.food?.name || "Unknown Item"}
              </li>
            ))}
          </ul>
          <p className="text-sm font-semibold text-brand-gray border-t pt-2 mt-2">
            Total: ₹{order.totalAmount.toFixed(2)} (
            {order.paymentDetails.method})
          </p>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-heading text-lg text-brand-gray mb-2">
            Delivery Address
          </h2>
          <p className="text-sm text-gray-700">
            {order.deliveryAddress?.address?.formatted ||
              "Address not available"}
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-6">
          <Link to="/" className="text-brand-orange hover:underline text-sm">
            Back to Home
          </Link>
        </div>
      </div>

      {/* --- Rating Popup Render (Now uses the imported component) --- */}
      <RatingPopup
        show={showRatingPopup}
        onClose={() => {
          setShowRatingPopup(false);
          setHasRated(true); // Mark as "dealt with" even if closed
        }}
        onSubmit={handleRatingSubmit}
        partnerName={order.foodPartner?.name || "this partner"}
        isSubmitting={isSubmittingRating}
        error={ratingError}
      />
    </div>
  );
}

export default OrderSuccessPage;
