import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPen, FaClock } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import LoadingComponent from "../../components/LoadingComponent"; // Adjust path if needed
import PersonalDetails from "../food-partner/partnerProfileComponents/PersonalDetails";
import LocationDetails from "../food-partner/partnerProfileComponents/LocationDetails";
import WorkingHours from "./partnerProfileComponents/WorkingHours";
import { useGeoLocation } from "../../hooks/useGeoLocation";
import updateNestedState from "../../utilities/updateNestedState";
import { getObjectDiff } from "../../utilities/dataDifference";
import { useNotification } from "../../components/Notification";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function PartnerProfile() {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState("personal");
  const fileInputRef = useRef(null);

  const [originalProfile, setOriginalProfile] = useState(null); // this is the original used for comparision for patch
  const [formData, setFormData] = useState(null); // this is what user will edit
  const [loading, setLoading] = useState(true);

  // lat and lng for formatted address
  const { location, requestLocation } = useGeoLocation();
  useEffect(() => {
    const fetchProfileData = async () => {
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1800));
      try {
        const response = await axios.get(`${apiUrl}/api/me`, {
          withCredentials: true,
        });
        const profileData = response.data.foodPartner;
        // to handle react error for child location
        if (!profileData.location) {
          profileData.location = {
            address: {
              formatted: "",
              street: "",
              block: "",
              building: "",
              floor: "",
              landmark: "",
            },
          };
        }
        if (
          !profileData.workingHours ||
          profileData.workingHours.length === 0
        ) {
          profileData.workingHours = Array(7)
            .fill(0)
            .map((_, i) => ({
              dayofWeek: i,
              isOpen: false,
              periods: [{ openTime: "09:00", closeTime: "17:00" }],
            }));
        }
        setOriginalProfile(profileData);
        setFormData(profileData);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        await minLoadingTime;
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  useEffect(() => {
    const getFormattedAddress = async () => {
      try {
        if (location) {
          const response = await axios.get(
            `${apiUrl}/api/location/reverse-geocode?lat=${location.lat}&lng=${location.lng}`
          );
          setFormData((prevData) => ({
            ...prevData,
            location: {
              ...prevData.location,
              address: {
                ...prevData.location.address,
                formatted: response.data.address,
              },
            },
          }));
        }
      } catch (error) {
        console.log(error);
      }
    };
    getFormattedAddress();
  }, [location]);

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        `${apiUrl}/api/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      const imageUrl = response.data.file.url;
      console.log(imageUrl);
      setFormData((prevData) => ({
        ...prevData,
        profilePhoto: imageUrl,
      }));
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      // alert("Failed to upload photo. Please try again.");
      showNotification("Failed to upload photo. Please try again");
    }
  };
  const handleFetchLocation = async () => {
    requestLocation();
  };
  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;
    const path = name.split(".");

    setFormData((prevData) => updateNestedState(prevData, path, newValue));
  };
  // New handlers for the periods array
  const handleAddPeriod = (dayIndex) => {
    setFormData((prevData) => {
      // Create a deep copy to work with
      const newWorkingHours = JSON.parse(JSON.stringify(prevData.workingHours));
      newWorkingHours[dayIndex].periods.push({
        openTime: "09:00",
        closeTime: "17:00",
      });

      return {
        ...prevData,
        workingHours: newWorkingHours,
      };
    });
  };

  const handleRemovePeriod = (dayIndex, periodIndex) => {
    setFormData((prevData) => {
      const newWorkingHours = JSON.parse(JSON.stringify(prevData.workingHours));
      // Filter out the period to be removed
      newWorkingHours[dayIndex].periods.splice(periodIndex, 1);

      return {
        ...prevData,
        workingHours: newWorkingHours,
      };
    });
  };

  const handleApplyToAll = () => {
    setFormData((prevData) => {
      // Use Monday's schedule (index 1) as the template
      const template = prevData.workingHours[1];
      const newWorkingHours = prevData.workingHours.map((day, index) => ({
        ...day, // Keep the dayofWeek
        isOpen: template.isOpen,
        periods: JSON.parse(JSON.stringify(template.periods)), // Deep copy periods
      }));

      return {
        ...prevData,
        workingHours: newWorkingHours,
      };
    });
  };

  const handleSave = async () => {
    if (!originalProfile || !formData) return;
    const updates = getObjectDiff(originalProfile, formData);
    if (Object.keys(updates).length === 0) {
      alert("No changes to save!");
      return;
    }
    try {
      const response = await axios.patch(
        `${apiUrl}/api/food-partner/profile`,
        updates,
        {
          withCredentials: true,
        }
      );
      setOriginalProfile(response.data.foodPartner);
      // alert("Profile updated Successfully!");
      showNotification("Profile updated Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      // alert("Failed to save changes. Please try again.");
      showNotification("Failed to save changes. Please try again.");
    }
  };
  const handleSectionClick = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (loading) {
    return <LoadingComponent message="Loading Profile..." minDuration={1800}/>;
  }

  if (!formData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Could not load profile. Please try again.
      </div>
    );
  }
  return (
    <div className="h-screen bg-brand-offwhite font-body flex flex-col">
      {/* Header */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center">
        <button
          onClick={() => {
            navigate(-1);
          }}
          className="text-brand-gray mr-4"
        >
          <IoArrowBack size={24} />
        </button>
        <h1 className="font-heading text-xl text-brand-gray">Edit Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-16 hide-scrollbar">
        {/* Profile Picture Section (UI only) */}
        <div className="flex flex-col items-center mb-8 hide-scrollbar">
          <div className="relative">
            <img
              src={formData.profilePhoto}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button
              onClick={handleImageUpload}
              className="absolute -bottom-1 -right-1 bg-brand-orange text-white p-2 rounded-full shadow-md"
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
            Username
          </h2>
        </div>

        {/* Form Sections */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hide-scrollbar">
          <form onSubmit={(e) => e.preventDefault()}>
            <PersonalDetails
              isOpen={openSection === "personal"}
              onToggle={() => handleSectionClick("personal")}
              personalData={formData} // Pass the whole object or just the relevant parts
              onInputChange={handleInputChange}
            />

            <LocationDetails
              isOpen={openSection === "location"}
              onToggle={() => handleSectionClick("location")}
              locationData={formData.location}
              onInputChange={handleInputChange}
              onFetchLocation={handleFetchLocation}
            />

            <WorkingHours
              isOpen={openSection === "hours"}
              icon={FaClock}
              onToggle={() => handleSectionClick("hours")}
              workingHoursData={formData.workingHours}
              onInputChange={handleInputChange}
              onAddPeriod={handleAddPeriod}
              onRemovePeriod={handleRemovePeriod}
              onApplyToAll={handleApplyToAll}
            />
          </form>
        </div>

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
