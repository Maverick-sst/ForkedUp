import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';

const logo =
  "https://ik.imagekit.io/eczrgfwzq/forkedUp_logo2.png?updatedAt=1761337612355";

const UnauthorizedPage = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/"; 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-50 p-6 text-center font-body">
      <img src={logo} alt="ForkedUp Logo" className="h-20 mb-8 opacity-80" />

      <Lock size={64} className="text-red-500 mb-6" />

      <h1 className="text-4xl font-heading text-red-700 mb-3">
        Access Denied
      </h1>
      <p className="text-lg text-red-600 mb-8 max-w-md">
        Sorry, you need to be logged in (or have the correct role) to access this page.
      </p>

      {/* Provide specific login links */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/user/login" // Link to User Login
          state={{ from: location.state?.from }} // Pass the original destination
          className="px-6 py-3 bg-brand-orange text-white font-heading rounded-lg shadow hover:opacity-90 transition-opacity"
        >
          User Login
        </Link>
        <Link
          to="/food-partner/login" // Link to Partner Login
          state={{ from: location.state?.from }} // Pass the original destination
          className="px-6 py-3 bg-gray-600 text-white font-heading rounded-lg shadow hover:bg-gray-700 transition-colors"
        >
          Partner Login
        </Link>
      </div>

       <Link
         to="/landing" // Always offer a way back to landing
         className="mt-6 text-sm text-gray-500 hover:underline"
       >
         Go to Landing Page
       </Link>
    </div>
  );
};

export default UnauthorizedPage;
