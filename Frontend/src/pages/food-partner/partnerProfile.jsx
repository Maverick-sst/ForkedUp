import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaPen, FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { IoArrowBack } from "react-icons/io5";
import AccordionSection from '../../components/AccordionSection';


function PartnerProfile() {
  const navigate = useNavigate();
  // State to manage which accordion section is open
  const [openSection, setOpenSection] = useState('personal'); // 'personal', 'location', or 'hours'

  // Ref for the file input
  const fileInputRef = useRef(null);

  // --- LOGIC TO BE ADDED ---
  // You will replace this with real form state, fetched data, and handlers
  const [formData, setFormData] = useState({
      profilePhoto: 'https://placehold.co/100x100/FFD1BA/FF7F50?text=Logo',
      name: 'The Corner Cafe',
      userName: 'corner_cafe',
      email: 'contact@cornercafe.com',
      phoneNo: '9876543210',
      location: {
          formatted: 'Bengaluru, Karnataka, India',
          street: '123 Foodie Lane',
          block: 'A',
          building: 'The Gourmet Tower',
          floor: 'Ground Floor',
          landmark: 'Opposite City Park'
      }
      // workingHours would also be part of this state
  });
  
  const handleSectionClick = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleImageUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // --- LOGIC TO BE ADDED ---
    // Here you would call your API to upload the file and then
    // update the formData.profilePhoto with the returned URL.
    console.log("Selected file:", file.name);
  };
  
  const handleSave = () => {
    // --- LOGIC TO BE ADDED ---
    // Here you would compare original data with formData,
    // create a 'updates' object, and send the PATCH request.
    console.log("Saving data...", formData);
    alert("Profile Saved!");
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-brand-offwhite font-body">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center">
         <button onClick={() => navigate(-1)} className="text-brand-gray mr-4">
            <IoArrowBack size={24}/>
         </button>
         <h1 className="font-heading text-xl text-brand-gray">Edit Profile</h1>
      </div>
      
      <div className="p-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={formData.profilePhoto}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button
              onClick={handleImageUploadClick}
              className="absolute -bottom-1 -right-1 bg-brand-orange text-white p-2 rounded-full shadow-md"
            >
              <FaPen size={12}/>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <h2 className="font-heading text-2xl text-brand-gray mt-4">{formData.userName}</h2>
          <p className="text-sm text-gray-500">0 Followers</p>
        </div>

        {/* Form Sections */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Personal Details */}
            <AccordionSection title="Personal Details" icon={FaUser} isOpen={openSection === 'personal'} onClick={() => handleSectionClick('personal')}>
                <input type="text" placeholder="Registered Name" defaultValue={formData.name} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
                <input type="text" placeholder="Username" defaultValue={formData.userName} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
                <input type="email" placeholder="Email" defaultValue={formData.email} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
                <input type="password" placeholder="New Password" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
                <input type="tel" placeholder="Phone Number" defaultValue={formData.phoneNo} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
            </AccordionSection>

            {/* Location Details */}
            <AccordionSection title="Location Details" icon={FaMapMarkerAlt} isOpen={openSection === 'location'} onClick={() => handleSectionClick('location')}>
                <input type="text" placeholder="Formatted Address" defaultValue={formData.location.formatted} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
                <input type="text" placeholder="Street" defaultValue={formData.location.street} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
                <input type="text" placeholder="Block / Sector" defaultValue={formData.location.block} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
                <input type="text" placeholder="Building Name" defaultValue={formData.location.building} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
                <input type="text" placeholder="Floor / Apartment" defaultValue={formData.location.floor} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
                <input type="text" placeholder="Landmark" defaultValue={formData.location.landmark} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
            </AccordionSection>
            
            {/* Working Hours */}
            <AccordionSection title="Working Hours" icon={FaClock} isOpen={openSection === 'hours'} onClick={() => handleSectionClick('hours')}>
                <p className="text-center text-gray-400">Working hours UI will go here.</p>
                {/* You can implement the weekday toggle and time pickers here */}
            </AccordionSection>
          </form>
        </div>
        
        {/* Save Button */}
        <div className="mt-8">
            <button
              onClick={handleSave}
              className="w-full py-3 px-6 bg-brand-green text-white font-heading rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
        </div>
      </div>
    </div>
  );
}

export default PartnerProfile;
