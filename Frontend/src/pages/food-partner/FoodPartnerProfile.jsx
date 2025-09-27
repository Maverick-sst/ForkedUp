// foodPartner_Profile.jsx
import { React, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const FoodPartnerProfile = () => {
  const { id } = useParams();
  const videoRefs = useRef(new Map());
  const [videos, SetVideos] = useState([]);
  const [profile, SetProfile] = useState({});

  // const [successMsg, SetSuccessMsg] = useState("");
  // const [errMsg, SetErrMsg] = useState("");
  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/food-partner/${id}`, {
        withCredentials: true,
      })
      .then((response) => {
        SetProfile(response.data.foodPartner);
        console.log(response.data.foodPartner.name)

        SetVideos(response.data.foodReels);
        
        
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);
  return (
    <div className="bg-white min-h-screen p-4 font-sans">
      <div className="flex items-center justify-between mb-6">
        {/* Profile Pic and Restro Name */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-300"></div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {profile.name}
            </h1>
            <p className="text-sm text-gray-500">Location</p>
          </div>
        </div>

        {/* Rating and Customers Served */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-gray-700 font-medium">4.2</span>
          </div>
          <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
            100+ customers served
          </div>
        </div>
      </div>

      {/* Follow and Opening Hours */}
      <div className="flex items-center justify-between mb-6">
        <button className="bg-green-500 text-white px-4 py-2 rounded-full font-medium">
          Follow
        </button>
        <p className="text-sm font-medium" style={{ color: "#ef233c" }}>
          Open: 9am to 12am
        </p>
      </div>

      {/* Separator */}
      <hr className="border-t border-gray-300 mb-6" />

      {/* Food Reels Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {videos.map((item)=>(
           <div key={item._id.toString()} className="aspect-w-9 aspect-h-16">
            <div className="w-full h-full bg-gray-200 rounded-lg">
              <video
            ref={(el) => {
              if (el) videoRefs.current.set(item._id, el);
              else videoRefs.current.delete(item._id);
            }}
            src={item.video} // backend field is `video`
            muted
            playsInline
            loop
            preload="metadata"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
            </div>
          </div>
        ))}
      </div>

      {/* Glassmorphism Menu Button */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          className="
            px-12 py-4
            rounded-full
            bg-white/40
            backdrop-blur-md
            text-gray-800
            font-medium
            border border-white/30
            shadow-lg
            transition
            hover:bg-white/60
          "
        >
          Menu
        </button>
      </div>
    </div>
  );
};

export default FoodPartnerProfile;
