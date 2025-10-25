import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useNotification } from "../../components/Notification";

const logo =
  "https://ik.imagekit.io/eczrgfwzq/forkedUp_logo2.png?updatedAt=1761337612355";

const UserRegistration = () => {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      showNotification("Name cannot be empty.", "error");
      return;
    }
    if (!userName.trim()) {
      showNotification("Username cannot be empty.", "error");
      return;
    }
    if (!email.trim()) {
      showNotification("Email cannot be empty.", "error");
      return;
    }
    if (!password) {
      showNotification("Password cannot be empty.", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Please enter a valid email address.", "error");
      return;
    }

    // Username validation (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(userName)) {
      showNotification(
        "Username can only contain letters, numbers, and underscores.",
        "error"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/user/register",
        {
          name,
          userName,
          email,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      showNotification(
        "Registration successful! Welcome to ForkedUp.",
        "success"
      );
      console.log(response);
      
      // **KEY FIX**: Wait for cookies to settle, then navigate
      // Don't set isLoading to false - let the navigation happen
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Navigate immediately after delay - component will unmount
      navigate("/user/login");
      
      // Note: No need to set isLoading(false) here as component unmounts
    } catch (error) {
      // **ONLY set isLoading to false on error**
      setIsLoading(false);
      
      const message =
        error.response?.data?.message ||
        (error.response?.status === 409
          ? "A user with this username or email already exists. Please choose different credentials."
          : "Registration failed. Please try again later.");
      showNotification(message, "error");
      console.error("Registration error:", error.response || error);
    }
    // **REMOVED finally block** - it was causing the issue
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-offwhite via-brand-peach/20 to-brand-offwhite p-4">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-lg border border-brand-gray-light space-y-6">
        {/* Logo */}
        <img src={logo} alt="ForkedUp Logo" className="h-20 mx-auto mb-4" />

        <h1 className="font-heading text-2xl text-brand-gray text-center font-semibold">
          User Registration
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-brand-gray mb-1.5">
              Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-brand-gray-light rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition duration-200"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-brand-gray mb-1.5">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-brand-gray-light rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition duration-200"
              placeholder="Your Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-brand-gray mb-1.5">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-gray-50 border border-brand-gray-light rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition duration-200"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-brand-gray mb-1.5">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 bg-gray-50 border border-brand-gray-light rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition duration-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
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
              "Register"
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-sm">
          <span className="text-brand-gray">Already have an account? </span>
          <Link
            to="/user/login"
            className="font-medium text-brand-orange hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;