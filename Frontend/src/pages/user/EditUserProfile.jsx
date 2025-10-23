import React, { useState, useRef, useEffect, useCallback } from "react";

// Corrected react-icons imports
import { FaPen } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import axios from "axios";

// Corrected relative path for components
import UserPersonalDetails from "./UserProfileComponents/UserPersonalDetails";
import UserLocationDetails from "./UserProfileComponents/UserLocationDetails";

// Corrected relative path for hooks and utilities
import { useGeoLocation } from "../../hooks/useGeoLocation";
import updateNestedState from "../../utilities/updateNestedState";
import { getObjectDiff } from "../../utilities/dataDifference";

// This component receives an `onClose` function prop from Profile.jsx
function EditUserProfile({ onClose }) {
  // const navigate = useNavigate(); // Unused navigation removed
  const [openSection, setOpenSection] = useState("personal");
  const fileInputRef = useRef(null);

  const [originalProfile, setOriginalProfile] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { location, status: geoStatus, requestLocation } = useGeoLocation();
  const [targetAddressIndexForGeo, setTargetAddressIndexForGeo] =
    useState(null);
  // --- Fetch Initial User Data ---
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await axios.get("http://localhost:8000/api/me", {
          withCredentials: true,
        });
        const profileData = response.data.user;

        if (!profileData.addresses) {
          profileData.addresses = [];
        }
        profileData.defaultAddress = profileData.defaultAddress ?? 0;
        if (
          profileData.defaultAddress >= profileData.addresses.length ||
          profileData.defaultAddress < 0
        ) {
          profileData.defaultAddress = 0;
        }

        setOriginalProfile(JSON.parse(JSON.stringify(profileData)));
        setFormData(profileData);
      } catch (error) {
        console.error("Failed to fetch user profile data:", error);
        setErrorMessage("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  useEffect(() => {
    // Only proceed if we have a location, a valid target index, and the status is ready
    if (
      location &&
      targetAddressIndexForGeo !== null &&
      geoStatus === "ready"
    ) {
      const fetchFormattedAddress = async () => {
        console.log(
          `Fetching address for coords: ${location.lat}, ${location.lng} for index ${targetAddressIndexForGeo}`
        );
        try {
          const response = await axios.get(
            `http://localhost:8000/api/location/reverse-geocode?lat=${location.lat}&lng=${location.lng}`
          );
          const formattedAddress = response.data.address;
          if (formattedAddress) {
            // Update the specific address's formatted field
            const path =
              `addresses.${targetAddressIndexForGeo}.location.address.formatted`.split(
                "."
              );
            setFormData((prevData) =>
              updateNestedState(prevData, path, formattedAddress)
            );
          }
        } catch (error) {
          console.error("Error fetching formatted address:", error);
          setErrorMessage("Could not fetch address for current location.");
        } finally {
          // Reset the target index after attempting to fetch
          setTargetAddressIndexForGeo(null);
        }
      };
      fetchFormattedAddress();
    } else if (
      geoStatus === "denied" ||
      geoStatus === "error" ||
      geoStatus === "unsupported"
    ) {
      // Handle errors or denial from the hook if needed (e.g., show message)
      if (targetAddressIndexForGeo !== null) {
        // Check if we were trying to fetch
        setErrorMessage(
          `Could not get location: ${geoStatus}. Please enter manually.`
        );
        setTargetAddressIndexForGeo(null); // Reset target
      }
    }
    // This effect depends on the location object, its status, and the target index
  }, [location, geoStatus, targetAddressIndexForGeo]);

  // --- Handlers ---

  const handleSectionClick = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/upload",
        uploadFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      const imageUrl = response.data.file?.url;
      if (imageUrl) {
        setFormData((prevData) => ({
          ...prevData,
          profilePhoto: imageUrl,
        }));
      } else {
        throw new Error("Image URL not found in upload response.");
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      setErrorMessage("Failed to upload photo. Please try again.");
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    const path = name.split(".");

    setFormData((prevData) => updateNestedState(prevData, path, newValue));
  }, []);

  const handleAddNewAddress = () => {
    setFormData((prevData) => ({
      ...prevData,
      addresses: [
        ...(prevData.addresses || []),
        {
          label: "other",
          location: {
            type: "Point",
            address: {
              formatted: "",
              street: "",
              block: "",
              building: "",
              floor: "",
              landmark: "",
            },
          },
        },
      ],
    }));
  };

  const handleRemoveAddress = (indexToRemove) => {
    setFormData((prevData) => {
      const updatedAddresses = prevData.addresses.filter(
        (_, index) => index !== indexToRemove
      );
      let newDefaultAddress = prevData.defaultAddress;
      if (indexToRemove === newDefaultAddress) {
        newDefaultAddress = 0;
      } else if (indexToRemove < newDefaultAddress) {
        newDefaultAddress -= 1;
      }
      if (newDefaultAddress >= updatedAddresses.length) {
        newDefaultAddress = Math.max(0, updatedAddresses.length - 1);
      }

      return {
        ...prevData,
        addresses: updatedAddresses,
        defaultAddress: newDefaultAddress,
      };
    });
  };

  const handleSetDefaultAddress = (index) => {
    if (index >= 0 && index < (formData?.addresses?.length || 0)) {
      setFormData((prevData) => ({
        ...prevData,
        defaultAddress: index,
      }));
    }
  };

  // Request current location for a specific address index
  const handleRequestLocation = (index) => {
    setTargetAddressIndexForGeo(index);
    requestLocation();
  };

  // --- Save Logic ---
  const handleSave = async () => {
    if (!originalProfile || !formData || isSaving) return;

    const formUpdates = { ...formData };
    if (formUpdates.password === "" || formUpdates.password === undefined) {
      delete formUpdates.password;
    }
    const originalComparable = { ...originalProfile };
    if (!originalComparable.password) delete originalComparable.password;

    const updates = getObjectDiff(originalComparable, formUpdates);

    if (updates.password && updates.password.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (updates.addresses) {
      for (const addr of updates.addresses) {
        if (
          !addr.location?.address?.formatted &&
          !addr.location?.address?.street
        ) {
          setErrorMessage(
            "Address details like Street or Formatted Address are required for saved addresses."
          );
          return;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      alert("No changes detected to save.");
      return;
    }

    console.log("Sending updates:", updates);
    setIsSaving(true);
    setErrorMessage("");

    try {
      // *** Ensure this endpoint exists and works in your backend ***
      const response = await axios.patch(
        "http://localhost:8000/api/user/profile", // <--- VERIFY/ADJUST THIS ENDPOINT
        updates,
        { withCredentials: true }
      );

      setOriginalProfile(JSON.parse(JSON.stringify(response.data.user)));
      setFormData(response.data.user);

      alert("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to save changes. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        Loading Profile...
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-6">
        <h2 className="text-red-600 mb-4">
          {errorMessage || "Could not load profile data."}
        </h2>
        <button onClick={onClose} className="text-brand-orange hover:underline">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-body">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center justify-between">
        <h1 className="font-heading text-xl text-brand-gray flex-grow text-center">
          Edit Profile
        </h1>
        <button onClick={onClose} className="text-brand-gray">
          <IoClose size={26} />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto p-6 bg-brand-offwhite">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={
                formData.profilePhoto ||
                `https://ui-avatars.com/api/?name=${
                  formData.userName?.charAt(0) || "U"
                }&background=random&color=fff&size=96`
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-gray-300"
            />
            <button
              onClick={handleImageUploadClick}
              className="absolute -bottom-1 -right-1 bg-brand-orange text-white p-2 rounded-full shadow-md hover:opacity-90 transition-opacity"
              aria-label="Change profile picture"
            >
              <FaPen size={12} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <h2 className="font-heading text-2xl text-brand-gray mt-4">
            {formData.userName}
          </h2>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded text-sm">
            {errorMessage}
          </div>
        )}

        {/* Form Sections */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <form onSubmit={(e) => e.preventDefault()}>
            <UserPersonalDetails
              isOpen={openSection === "personal"}
              onToggle={() => handleSectionClick("personal")}
              userData={formData}
              onInputChange={handleInputChange}
            />
            <UserLocationDetails
              isOpen={openSection === "location"}
              onToggle={() => handleSectionClick("location")}
              addresses={formData.addresses || []}
              defaultAddressIndex={formData.defaultAddress}
              onInputChange={handleInputChange}
              onAddNewAddress={handleAddNewAddress}
              onRemoveAddress={handleRemoveAddress}
              onSetDefault={handleSetDefaultAddress}
              onRequestLocation={handleRequestLocation}
              geoStatus={geoStatus}
            />
          </form>
        </div>
      </div>

      {/* Sticky Footer with Save Button */}
      <div className="fixed inset-x-0 bottom-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t p-4 z-10 flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full max-w-md mx-auto block py-3 px-6 text-white font-heading rounded-lg shadow transition-opacity ${
            isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-brand-green hover:opacity-90"
          }`}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default EditUserProfile;
