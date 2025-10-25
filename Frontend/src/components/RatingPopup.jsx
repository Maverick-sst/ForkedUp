import { useState, useEffect } from "react";
import { FaStar, FaTimes } from "react-icons/fa";

const RatingPopup = ({
  show,
  onClose,
  onSubmit,
  partnerName,
  isSubmitting,
  error,
}) => {
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    // Only submit if a rating is chosen
    if (currentRating === 0) return;
    onSubmit(currentRating, comment);
  };

  // Reset internal state when popup is closed/hidden
  useEffect(() => {
    if (!show) {
      setCurrentRating(0);
      setHoverRating(0);
      setComment("");
    }
  }, [show]);

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-5 transform transition-transform duration-300 ease-in-out ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-lg font-semibold text-brand-gray">
          Rate your order from {partnerName}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close rating popup"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Star Rating */}
      <div className="flex justify-center items-center gap-2 my-4">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <label key={ratingValue}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => setCurrentRating(ratingValue)}
                className="hidden" // Hide the actual radio button
              />
              <FaStar
                size={32}
                className="cursor-pointer transition-colors"
                color={
                  ratingValue <= (hoverRating || currentRating)
                    ? "#FFC107" // Yellow for filled
                    : "#E4E5E9" // Gray for empty
                }
                onMouseEnter={() => setHoverRating(ratingValue)}
                onMouseLeave={() => setHoverRating(0)}
              />
            </label>
          );
        })}
      </div>

      {/* Comment Box */}
      <textarea
        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
        rows="3"
        placeholder="Add a comment (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={currentRating === 0 || isSubmitting}
        className="w-full mt-4 py-3 bg-brand-orange text-white font-semibold rounded-lg shadow-md transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
};

export default RatingPopup;
