import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaDollarSign, FaStar, FaPlus, FaEye } from 'react-icons/fa';
import { LuSettings2 } from "react-icons/lu";
import ProgressRing from '../../components/ProgressRing';

// ===================================================================================
// 1. ONBOARDING VIEW: Shown to new partners who need to complete their profile.
// ===================================================================================
const OnboardingView = () => {
  const profileCompletion = 25; // Placeholder percentage

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center animate-fade-in">
      <p className="text-brand-gray mb-6">
        Complete your profile to start selling
      </p>

      <ProgressRing percentage={profileCompletion} />

      <Link
        to="/food-partner/profile/edit" // This route will lead to the profile setup form
        className="mt-8 w-full py-3 px-6 bg-brand-orange text-white font-heading rounded-lg shadow-md hover:bg-brand-peach hover:text-brand-gray transition-colors duration-300"
      >
        Setup Profile
      </Link>
    </div>
  );
};

// ===================================================================================
// 2. OPERATIONAL DASHBOARD: The main control center for an active partner.
// ===================================================================================
const OperationalDashboard = () => {
  return (
    <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
      {/* --- IMMEDIATE ACTIONS --- */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl text-brand-gray">Restaurant Status</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
            <span className="ml-3 text-sm font-medium text-brand-gray">Online</span>
          </label>
        </div>
        <div className="border-t border-brand-gray-light pt-4">
           <h3 className="font-heading text-lg text-brand-gray mb-2">New Orders</h3>
           {/* Placeholder for new orders - you can map over live orders here */}
           <div className="text-center text-gray-400 py-4">
             <p>No new orders right now.</p>
           </div>
        </div>
      </div>

      {/* --- AT-A-GLANCE --- */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="font-heading text-xl text-brand-gray mb-4">Today's Snapshot</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <FaDollarSign className="mx-auto text-brand-green mb-1" size={24} />
            <p className="font-heading text-2xl">$540</p>
            <p className="text-xs text-gray-400">Sales</p>
          </div>
          <div>
            <FaClipboardList className="mx-auto text-brand-orange mb-1" size={24} />
            <p className="font-heading text-2xl">32</p>
            <p className="text-xs text-gray-400">Orders</p>
          </div>
          <div>
            <FaStar className="mx-auto text-yellow-400 mb-1" size={24} />
            <p className="font-heading text-2xl">4.8</p>
            <p className="text-xs text-gray-400">Rating</p>
          </div>
        </div>
      </div>
      
      {/* --- QUICK ACCESS --- */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <Link to="/add-food" className="flex flex-col items-center text-brand-gray p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:text-brand-orange transition-all">
          <FaPlus size={24} className="mb-2"/>
          <span className="text-xs font-semibold">Add Dish</span>
        </Link>
        <Link to="/food-partner/menu" className="flex flex-col items-center text-brand-gray p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:text-brand-orange transition-all">
          <FaEye size={24} className="mb-2"/>
          <span className="text-xs font-semibold">View Menu</span>
        </Link>
        <Link to="/food-partner/profile/edit" className="flex flex-col items-center text-brand-gray p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:text-brand-orange transition-all">
          <LuSettings2 size={24} className="mb-2"/>
          <span className="text-xs font-semibold">Edit Profile</span>
        </Link>
      </div>
    </div>
  );
};

// ===================================================================================
// 3. MAIN DASHBOARD COMPONENT: Decides which view to render.
// ===================================================================================
function Dashboard() {
  // --- LOGIC TO BE ADDED ---
  // You will replace this with a real state based on fetched user data.
  // For now, you can toggle it between `true` and `false` to see both UI states.
  const [isProfileComplete, setIsProfileComplete] = useState(true); 
  const username = "Maverick"; // This will also come from your data fetch.

  return (
    <div className="flex flex-col items-center min-h-screen bg-brand-offwhite p-6 font-body">
      <h1 className="text-3xl font-heading text-brand-gray mb-8">
        Hello, {username}
      </h1>
      
      {/* This is where you will plug in your logic. */}
      {isProfileComplete ? <OperationalDashboard /> : <OnboardingView />}
    </div>
  );
}

export default Dashboard;
