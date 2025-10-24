import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function SearchResultItem({ item }) {
  const { addItemToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const itemToAdd = {
      foodId: item._id,
      name: item.name,
      price: item.price,
      foodPartner: item.foodPartner?._id || item.foodPartner,
      videoUrl: item.video,
    };
    addItemToCart(itemToAdd);
    console.log(`${item.name} added to Cart`);
  };

  if (!item) return null;

  const partnerId = item.foodPartner?._id || item.foodPartner;

  return (
    <Link
      to={`/food-partner/${partnerId}/${item._id}`}
      className="flex gap-3 items-center p-3 bg-white rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" // Added cursor-pointer
    >
      {/* Video Preview / Image Placeholder */}
      <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden relative">
        <video
          src={item.video}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Item Details */}
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-brand-gray text-sm truncate">
          {item.name}
        </p>
        <p className="text-xs text-gray-500 line-clamp-2 mb-1">
          {item.description || "No description."}
        </p>
        <div className="flex justify-between items-center mt-1">
          <span className="font-bold text-brand-orange text-sm">
            ₹{item.price?.toFixed(2)}
          </span>
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="text-xs bg-brand-green text-white px-2.5 py-1 rounded-full hover:opacity-90 active:scale-95 transition text-nowrap" // Added active state
          >
            Add +
          </button>
        </div>
        {/* Show Partner Name */}
        <p className="text-xs text-gray-400 mt-1 truncate">
          From: {item.foodPartner?.name || "Restaurant"}
        </p>
      </div>
    </Link>
  );
}

export default SearchResultItem;
