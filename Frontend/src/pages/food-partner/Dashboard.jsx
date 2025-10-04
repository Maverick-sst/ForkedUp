import React from 'react';
import { Link } from 'react-router-dom';
import ProgressRing from '../../components/ProgressRing';

function Dashboard() {
  // We'll use a placeholder username and percentage for the UI
  const username = "Maverick";
  const profileCompletion = 25; // Example percentage

  return (
    <div className="flex flex-col items-center min-h-screen bg-brand-offwhite p-6 font-body">
      {/* Greeting */}
      <h1 className="text-3xl font-heading text-brand-gray mb-8">
        Hello, {username}
      </h1>

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
        <p className="text-brand-gray mb-6">
          Complete your profile to start selling
        </p>

        {/* Progress Ring */}
        <ProgressRing percentage={profileCompletion} />

        {/* Setup Profile Button */}
        <Link
          to="/profile/edit" 
          className="mt-8 w-full py-3 px-6 bg-brand-orange text-white font-heading rounded-lg shadow-md hover:bg-brand-peach hover:text-brand-gray transition-colors duration-300"
        >
          Setup Profile
        </Link>
      </div>

      {/* Hidden Section */}
      <div className="w-full max-w-sm bg-brand-gray-light rounded-2xl p-8 mt-8 text-center text-gray-400">
        <p className="font-heading">Get Started</p>
        <p className="text-sm mt-2">(This section will unlock after profile setup)</p>
      </div>
    </div>
  );
}

export default Dashboard;