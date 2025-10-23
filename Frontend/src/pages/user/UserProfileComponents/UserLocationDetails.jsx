import React from "react";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaStar,
  FaCrosshairs,
} from "react-icons/fa";
import AccordionSection from "../../../components/AccordionSection"; // Adjust path if needed

const UserLocationDetails = ({
  addresses = [], // Default to empty array
  defaultAddressIndex = 0,
  isOpen,
  onToggle,
  onInputChange,
  onAddNewAddress,
  onRemoveAddress,
  onSetDefault,
  onRequestLocation, // Receive the function to request location
  // Add onEditAddress prop later if implementing edit functionality
}) => {
  return (
    <AccordionSection
      title="Addresses"
      icon={FaMapMarkerAlt}
      isOpen={isOpen}
      onClick={onToggle}
    >
      {addresses.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">
          No saved addresses yet.
        </p>
      )}

      {addresses.map((addr, index) => (
        <div
          key={addr._id || index}
          className="border border-gray-200 rounded-lg p-3 mb-3 relative bg-gray-50"
        >
          {/* Default Address Indicator */}
          {index === defaultAddressIndex && (
            <span className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <FaStar size={10} /> Default
            </span>
          )}
          {/* --- ADDED: Use Current Location Button --- */}
          <p className="text-sm font-semibold text-brand-gray capitalize mb-1">
            {addr.label}
          </p>
          <p className="text-xs text-gray-600 mb-2">
            {addr.location?.address?.formatted ||
              `${addr.location?.address?.building || ""}, ${
                addr.location?.address?.street || ""
              }`.replace(/^, |, $/g, "") || // Basic fallback display
              "Address details missing"}
          </p>

          {/* Input fields for editing (simplified view for now, could be separate component) */}
          {/* Formatted Address */}
          <div className="relative">
            <input
              type="text"
              name={`addresses.${index}.location.address.formatted`}
              placeholder="Formatted Address"
              value={addr.location?.address?.formatted || ""}
              onChange={onInputChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-xs p-1.5 mb-1 pr-10"
            />
            <button
              type="button"
              onClick={() => onRequestLocation(index)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-gray hover:text-brand-orange"
              aria-label="Use current location"
            >
              <FaCrosshairs />
            </button>
          </div>
          {/* Street */}
          <input
            type="text"
            name={`addresses.${index}.location.address.street`}
            placeholder="Street"
            value={addr.location?.address?.street || ""}
            onChange={onInputChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-xs p-1.5 mb-1"
          />
          {/* Row for Block/Building */}
          <div className="grid grid-cols-2 gap-1 mb-1">
            <input
              type="text"
              name={`addresses.${index}.location.address.block`}
              placeholder="Block"
              value={addr.location?.address?.block || ""}
              onChange={onInputChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-xs p-1.5"
            />
            <input
              type="text"
              name={`addresses.${index}.location.address.building`}
              placeholder="Building"
              value={addr.location?.address?.building || ""}
              onChange={onInputChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-xs p-1.5"
            />
          </div>
          {/* Row for Floor/Landmark */}
          <div className="grid grid-cols-2 gap-1 mb-2">
            <input
              type="text"
              name={`addresses.${index}.location.address.floor`}
              placeholder="Floor"
              value={addr.location?.address?.floor || ""}
              onChange={onInputChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-xs p-1.5"
            />
            <input
              type="text"
              name={`addresses.${index}.location.address.landmark`}
              placeholder="Landmark"
              value={addr.location?.address?.landmark || ""}
              onChange={onInputChange}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-xs p-1.5"
            />
          </div>

          {/* Address Label Radio */}
          <div className="flex items-center gap-3 mb-2 text-xs">
            <span className="font-medium text-gray-700">Label:</span>
            {["home", "work", "other"].map((label) => (
              <label
                key={label}
                className="flex items-center gap-1 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`addresses.${index}.label`} // Correct name for nested state
                  value={label}
                  checked={addr.label === label}
                  onChange={onInputChange}
                  className="text-brand-orange focus:ring-brand-orange focus:ring-1"
                />
                <span className="capitalize">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between items-center mt-2">
            {index !== defaultAddressIndex ? (
              <button
                type="button"
                onClick={() => onSetDefault(index)}
                className="text-xs text-blue-600 hover:underline"
              >
                Set as Default
              </button>
            ) : (
              <span className="text-xs text-gray-400">Current Default</span> // Placeholder if already default
            )}
            <button
              type="button"
              onClick={() => onRemoveAddress(index)}
              className="text-red-500 hover:text-red-700"
              aria-label={`Remove ${addr.label} address`}
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddNewAddress}
        className="mt-2 flex items-center justify-center w-full py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm text-brand-orange hover:bg-gray-50 transition-colors"
      >
        <FaPlus className="mr-2" size={12} /> Add New Address
      </button>
    </AccordionSection>
  );
};

export default UserLocationDetails;
