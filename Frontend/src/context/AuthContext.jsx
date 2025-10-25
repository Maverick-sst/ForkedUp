/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import LoadingComponent from "../components/LoadingComponent";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    role: null,
  });

  // Function to check authentication status via API
  const checkAuthStatus = useCallback(async () => {
    // Keep isLoading true until check is complete
    setAuthState((prevState) => ({ ...prevState, isLoading: true }));
    try {
      // Use your existing /api/me endpoint which relies on the httpOnly cookie
      const response = await axios.get(`${apiUrl}/api/me`, {
        withCredentials: true,
      });

      // Determine user/partner and role from response
      let user = null;
      let role = null;
      if (response.data?.user) {
        user = response.data.user;
        role = "user";
      } else if (response.data?.foodPartner) {
        user = response.data.foodPartner;
        role = "foodpartner";
      }

      if (user && role) {
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: user,
          role: role,
        });
        console.log(`Auth Check Success: Logged in as ${role}`);
      } else {
        // Endpoint succeeded but didn't return expected data
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          role: null,
        });
        console.log("Auth Check Failed: No user/partner data in response");
      }
    } catch (error) {
      // If /api/me fails (likely 401 Unauthorized), the user is not logged in
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        console.log("Auth Check Failed: Unauthorized (No valid session)");
      } else {
        console.error("Auth Check Error:", error); // Log other errors
      }
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        role: null,
      });
    }
  }, []);

  // Check auth status on initial load
  useEffect(() => {
    console.log("AuthProvider mounted, checking auth status...");
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Provide state and potentially re-check function to children
  const value = {
    authState,
    checkAuthStatus, // Allow components (like Login/Logout) to trigger re-check if needed
  };

  // Show loading indicator while checking auth status initially
  if (authState.isLoading) {
    return <LoadingComponent message="Authenticating..." minDuration={1000} />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Custom Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
