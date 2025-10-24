import { FaUser } from "react-icons/fa";
import AccordionSection from "../../../components/AccordionSection";

const UserPersonalDetails = ({ userData, isOpen, onToggle, onInputChange }) => {
  return (
    <AccordionSection
      title="Personal Details"
      icon={FaUser}
      isOpen={isOpen}
      onClick={onToggle}
    >
      {/* Name */}
      <div className="mb-3">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Your Full Name"
          value={userData.name || ""}
          onChange={onInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2"
          required
        />
      </div>

      {/* Username */}
      <div className="mb-3">
        <label
          htmlFor="userName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Username
        </label>
        <input
          id="userName"
          type="text"
          name="userName"
          placeholder="Your Username"
          value={userData.userName || ""}
          onChange={onInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2"
          required
        />
      </div>

      {/* Email */}
      <div className="mb-3">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="your.email@example.com"
          value={userData.email || ""}
          onChange={onInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2"
          required
        />
      </div>

      {/* Phone Number */}
      <div className="mb-3">
        <label
          htmlFor="phoneNo"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone Number (Optional)
        </label>
        <input
          id="phoneNo"
          type="tel"
          name="phoneNo"
          placeholder="Your Phone Number"
          value={userData.phoneNo || ""}
          onChange={onInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2"
        />
      </div>

      {/* Password */}
      <div className="mb-3">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          New Password (Optional)
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter new password to change"
          onChange={onInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange text-sm p-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave blank to keep current password.
        </p>
      </div>
    </AccordionSection>
  );
};

export default UserPersonalDetails;
