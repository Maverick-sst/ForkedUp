import React from 'react';
import { FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa';
import AccordionSection from '../../../components/AccordionSection';

// This is a "controlled component". It receives its data and the functions to change that data via props.
const LocationDetails = ({ locationData, isOpen, onToggle, onInputChange, onFetchLocation }) => {

  return (
    <AccordionSection title="Location Details" icon={FaMapMarkerAlt} isOpen={isOpen} onClick={onToggle}>
      
      <div className="relative">
        <input 
          type="text" 
          name="location.address.formatted" 
          placeholder="Formatted Address" 
          value={locationData.address.formatted}
          onChange={onInputChange}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange pr-10" 
        />
        <button 
          type="button" 
          onClick={onFetchLocation}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-gray hover:text-brand-orange"
        >
          <FaCrosshairs />
        </button>
      </div>

      <input type="text" name="location.address.street" placeholder="Street" value={locationData.address.street} onChange={onInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
      <input type="text" name="location.address.block" placeholder="Block / Sector" value={locationData.address.block} onChange={onInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
      <input type="text" name="location.address.building" placeholder="Building Name" value={locationData.address.building} onChange={onInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
      <input type="text" name="location.address.floor" placeholder="Floor / Apartment" value={locationData.address.floor} onChange={onInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
      <input type="text" name="location.address.landmark" placeholder="Landmark (optional)" value={locationData.address.landmark} onChange={onInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
    </AccordionSection>
  );
};

export default LocationDetails;