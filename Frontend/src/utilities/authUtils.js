import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Clears all browser storage and cookies on logout
 * Prevents conflicts between different user sessions
 */
export const handleLogout = async (navigate, userRole) => { 
  try {
    let logoutUrl = '';
    // Determine the correct logout endpoint based on the role
    if (userRole === 'user') {
      logoutUrl = `${apiUrl}/api/auth/user/logout`;
    } else if (userRole === 'foodpartner') {
      logoutUrl = `${apiUrl}/api/auth/foodPartner/logout`;
    } else {
      console.warn('Unknown user role for logout:', userRole);

    }
    // Clear frontend storage regardless of backend call success
    localStorage.clear();
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization']; // If you set this elsewhere

    // Navigate to landing page (root route)
    navigate('/');
    setTimeout(() => window.location.reload(), 50);
    console.log('Frontend logout steps completed.');

  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
    localStorage.clear();
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
    setTimeout(() => window.location.reload(), 50);
  }
};

/**
 * Clears cart-specific data (useful when switching between users)
 */
export const clearCartData = () => {
  localStorage.removeItem('cartItems');
};

/**
 * Clears user-specific cached data
 */
export const clearUserCache = () => {
  localStorage.removeItem('userAddress');
  // Add any other cached user data keys here
};
