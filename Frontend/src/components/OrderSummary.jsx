import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import LoadingComponent from "./LoadingComponent"; 
const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getOrderStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return {
        icon: <Clock size={14} className="text-yellow-500" />,
        text: "Pending",
        color: "text-yellow-500 bg-yellow-100",
      };
    case "accepted":
    case "preparing":
    case "ready_for_pickup":
    case "out_for_delivery":
      return {
        icon: <Clock size={14} className="text-blue-500" />,
        text: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        color: "text-blue-500 bg-blue-100",
      };
    case "delivered":
      return {
        icon: <CheckCircle size={14} className="text-green-500" />,
        text: "Delivered",
        color: "text-green-500 bg-green-100",
      };
    case "rejected":
    case "cancelled":
      return {
        icon: <XCircle size={14} className="text-red-500" />,
        text: status.charAt(0).toUpperCase() + status.slice(1),
        color: "text-red-500 bg-red-100",
      };
    default:
      return {
        icon: <Clock size={14} className="text-gray-500" />,
        text: "Unknown",
        color: "text-gray-500 bg-gray-100",
      };
  }
};

function OrderSummary() {
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      setErrorOrders(null);
      try {
        const response = await axios.get(
          "http://localhost:8000/api/orders/user",
          {
            withCredentials: true,
          }
        );
        setUserOrders(response.data.orders || []);
      } catch (err) {
        console.error("Error fetching user orders:", err);
        setErrorOrders(err.response?.data?.message || "Could not load orders.");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, []);

  if (loadingOrders) {
    return <LoadingComponent message="Loading orders..." />;
  }

  if (errorOrders) {
    return <p className="text-center text-red-500 mt-8">{errorOrders}</p>;
  }

  if (userOrders.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-8">
        You haven't placed any orders yet.
      </p>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {userOrders.map((order) => {
        const statusStyle = getOrderStatusStyle(order.orderStatus);
        const firstItemName = order.items?.[0]?.food?.name || "";
        const additionalItemsCount = (order.items?.length || 0) - 1;

        return (
          <Link
            key={order._id}
            to={`/order-success/${order._id}`}
            className="block bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm text-brand-gray">
                  {order.foodPartner?.name || "Restaurant"}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${statusStyle.color}`}
              >
                {statusStyle.icon} {statusStyle.text}
              </span>
            </div>
            <div className="text-xs text-gray-600 mb-2 truncate">
              {firstItemName}
              {additionalItemsCount > 0 && ` + ${additionalItemsCount} more`}
            </div>
            <div className="flex justify-between items-center text-sm mt-1 border-t pt-2">
              <span className="text-gray-600">
                {order.items?.length || 0} item(s)
              </span>
              <span className="font-semibold text-brand-orange">
                ₹{order.totalAmount?.toFixed(2) || "0.00"}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default OrderSummary;
