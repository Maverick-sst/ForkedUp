import React, { useRef, useState, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateFood() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State for text-based form data
  const [textData, setTextData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Main Course',
    dietaryPreference: 'Veg',
    cuisine: '',
  });

  // State for the video file itself
  const [videoFile, setVideoFile] = useState(null);
  
  // State for the local video preview URL
  const [previewUrl, setPreviewUrl] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTextData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Revoke the old preview URL if one exists to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setVideoFile(file);
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!videoFile) {
    alert("Please select a video to upload.");
    return;
  }
  setIsSubmitting(true);

  try {
    // Step 1: Upload the video file
    const uploadFormData = new FormData();
    uploadFormData.append("file", videoFile);

    const uploadResponse = await axios.post(
      "http://localhost:8000/api/upload",
      uploadFormData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );
    
    // You now have the URL in a local variable
    const uploadedReelUrl = uploadResponse.data.file.url;

    // --- THIS IS THE FIX ---
    // 2. Do NOT rely on state. Build the final payload directly.
    const finalFoodData = {
      ...textData, // The text fields from your state
      video: uploadedReelUrl, // The new URL you just received
    };
    // --- END OF FIX ---

    // 3. Send the complete, final data object to the create food endpoint
    await axios.post(
      "http://localhost:8000/api/food/",
      finalFoodData, // Use the new object here
      { withCredentials: true }
    );

    alert("Food Added to menu!");
    navigate(-1);

  } catch (error) {
    console.log("Couldn't add food to menu: " + error);
    alert("Couldn't Add Food. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
  // Effect for cleaning up the preview URL when the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-brand-offwhite font-body">
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center">
         <button onClick={() => navigate(-1)} className="text-brand-gray mr-4">
            <IoArrowBack size={24}/>
         </button>
         <h1 className="font-heading text-xl text-brand-gray">Add New Dish</h1>
      </div>

      <div className="p-6">
        <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-brand-gray mb-2">Food Reel Video*</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                     <video src={previewUrl} className="mx-auto h-24 rounded-md" controls />
                  ) : (
                     <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex justify-center text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-orange hover:text-brand-peach">
                      <span>{previewUrl ? 'Change video' : 'Upload a video'}</span>
                      <input id="file-upload" name="file-upload" type="file" ref={fileInputRef} className="sr-only" accept="video/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="name" required placeholder="Dish Name" value={textData.name} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
              <input type="number" name="price" required placeholder="Price" value={textData.price} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />
            </div>

            <textarea name="description" placeholder="Description" rows="3" value={textData.description} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange"></textarea>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select name="category" value={textData.category} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange">
                <option>Starter</option>
                <option>Main Course</option>
                <option>Dessert</option>
                <option>Beverage</option>
                <option>Side Dish</option>
              </select>
              <select name="dietaryPreference" value={textData.dietaryPreference} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange">
                <option>Veg</option>
                <option>Non-Veg</option>
                <option>Vegan</option>
                <option>Jain</option>
              </select>
            </div>
            
            <input type="text" name="cuisine" placeholder="Cuisine (e.g., Indian, Italian)" value={textData.cuisine} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-orange focus:ring-brand-orange" />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-brand-green text-white font-heading rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Add Dish to Menu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateFood;