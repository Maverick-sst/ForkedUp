import React from "react";
import { useGeoLocation } from "../../hooks/useGeoLocation";
import { Link } from "react-router-dom";
import { FaHome, FaUser } from "react-icons/fa";

function Home() {
  const { location, status, requestLocation, clearLocation } = useGeoLocation();

  return (
    <div className="relative h-screen w-full bg-white text-black overflow-hidden">
      {/* Background overlay video */}
      <video
        src="/sample-bg.mp4" // replace with actual video path
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top bar: location + user profile */}
        <div className="flex justify-between items-center px-4 py-4 bg-white/70 backdrop-blur-md rounded-b-xl shadow">
          <div className="text-sm px-3 py-1 rounded-lg border">
          {status === "ready" && location
            ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`
            : status === "loading"
            ? "Detecting..."
            : status === "denied"
            ? "Location blocked"
            : "Set location"}
        </div>

        <button
          onClick={requestLocation}
          className="px-3 py-1 rounded bg-brand-orange text-white"
        >
          Allow location
        </button>
          <Link to="/profile">
            Hey,Username
          </Link>
        </div>

        {/* Search bar */}
        <div className="px-4 mt-4">
          <input
            type="text"
            placeholder="Search reel by dishname or restro name"
            className="w-full px-4 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-gray-300 placeholder-gray-500 text-sm outline-none"
          />
        </div>

        {/* Centered Explore Feed button */}
        <div className="flex-1 flex items-center justify-center">
          <Link to="/feed">
            <button className="px-6 py-3 rounded-xl bg-brand-orange text-black font-heading shadow hover:bg-brand-peach transition">
              Explore Feed
            </button>
          </Link>
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 w-full px-8 py-2 flex justify-between items-center bg-white/80 backdrop-blur-md border-t border-gray-200 z-20">
          <Link to="/">
            <FaHome size={24} className="text-black" />
          </Link>
          <Link to="/profile">
            <FaUser size={24} className="text-black" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
