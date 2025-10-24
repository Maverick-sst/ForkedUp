import React from "react";
import { FaUser } from "react-icons/fa";
import AccordionSection from "../../../components/AccordionSection";

const PersonalDetails = ({ personalData, isOpen, onToggle, onInputChange }) => {
  return (
    <AccordionSection
      title="Personal Details"
      icon={FaUser}
      isOpen={isOpen}
      onClick={onToggle}
    >
      <input
        type="text"
        name="name"
        placeholder="Registered Name"
        value={personalData.name}
        onChange={onInputChange}
        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange"
      />
      <input
        type="text"
        name="userName"
        placeholder="Username"
        value={personalData.userName}
        onChange={onInputChange}
        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={personalData.email}
        onChange={onInputChange}
        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={onInputChange}
        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange"
      />
      <input
        type="tel"
        name="phoneNo"
        placeholder="Phone Number"
        value={personalData.phoneNo}
        onChange={onInputChange}
        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange"
      />
    </AccordionSection>
  );
};

export default PersonalDetails;
