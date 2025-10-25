import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

const logo =
  "https://ik.imagekit.io/eczrgfwzq/forkedUp_logo2.png?updatedAt=1761337612355";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-brand-offwhite via-brand-peach/20 to-brand-offwhite p-6 text-center font-body">
      <img src={logo} alt="ForkedUp Logo" className="h-24 mb-8" />

      <SearchX size={64} className="text-brand-orange mb-6" />

      <h1 className="text-4xl font-heading text-brand-gray mb-3">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-brand-gray mb-8 max-w-md">
        Oops! It seems like the page you were looking for doesn't exist or has
        been moved.
      </p>

      <div className="flex gap-4">
        <Link
          to="/" // Link to the Home page
          className="px-6 py-3 bg-brand-orange text-white font-heading rounded-lg shadow hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
        <button
          onClick={() => window.history.back()} // Go back to previous page
          className="px-6 py-3 bg-gray-200 text-brand-gray font-heading rounded-lg shadow hover:bg-gray-300 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
