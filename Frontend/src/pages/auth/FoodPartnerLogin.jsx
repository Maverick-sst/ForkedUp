import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "/src/context/AuthContext.jsx";
import { useNotification } from "/src/components/Notification.jsx";
import { Eye, EyeOff } from "lucide-react";
const logo =
  "https://ik.imagekit.io/eczrgfwzq/forkedUp_logo2.png?updatedAt=1761337612355";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const FoodPartnerLogin = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthStatus } = useAuth();
  const { showNotification } = useNotification();

  const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName.trim()) {
      showNotification("Username or Email cannot be empty.", "error");
      return;
    }
    if (!password) {
      showNotification("Password cannot be empty.", "error");
      return;
    }

    setIsLoading(true);

    const loginData = isEmail(userName)
      ? { email: userName, password }
      : { userName, password };

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/foodPartner/login`,
        loginData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (response.data?.token) {
        localStorage.setItem("authToken", response.data.token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
      }

      showNotification("Login successful! Welcome back.", "success");
      console.log("Login response:", response);

      await checkAuthStatus();

      const redirectPath = location.state?.from?.pathname || "/dashboard";
      console.log("Redirecting partner to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response?.status === 401
          ? "Invalid credentials."
          : "Login failed. Please try again.");
      showNotification(message, "error");
      console.error("Login error:", error.response || error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-offwhite via-brand-peach/20 to-brand-offwhite p-4">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-lg border border-brand-gray-light space-y-6">
        {/* Logo */}
        <img src={logo} alt="ForkedUp Logo" className="h-20 mx-auto mb-4" />

        <h1 className="font-heading text-2xl text-brand-gray text-center font-semibold">
          Food Partner Login
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username or Email Input */}
          <div>
            <label className="block text-sm font-medium text-brand-gray mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-brand-gray-light rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition duration-200"
              placeholder="Your Username or Email"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="relative">
            <label className="block text-sm font-medium text-brand-gray mb-1.5">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"} // Toggle type based on state
              className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-brand-gray-light rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition duration-200" // Added pr-10 for icon space
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button" // Important: Prevent form submission
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-[-4px] text-brand-gray hover:text-brand-orange focus:outline-none" // Position the button
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 text-white font-heading rounded-lg shadow transition duration-200 ease-in-out flex items-center justify-center ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-brand-orange hover:opacity-90 active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center text-sm">
          <span className="text-brand-gray">Don't have an account? </span>
          <Link
            to="/food-partner/register"
            className="font-medium text-brand-orange hover:underline"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;
