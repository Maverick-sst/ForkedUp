import axios from 'axios';

/**
 * Clears all browser storage and cookies on logout
 * Prevents conflicts between different user sessions
 */
export const handleLogout = async (navigate) => {
  try {
    // 1. Call backend logout endpoint if you have one
    await axios.delete('http://localhost:8000/api/auth/logout', {}, { withCredentials: true });
    
    // 2. Clear localStorage completely
    localStorage.clear();
    
    // 3. Clear sessionStorage
    sessionStorage.clear();
    
    // 4. Clear axios default headers
    delete axios.defaults.headers.common['Authorization'];
    
    // 5. Navigate to landing page
    navigate('/landing');
    
    console.log('Logout successful - all storage cleared');
  } catch (error) {
    console.error('Logout error:', error);
    // Even if backend logout fails, clear local storage
    localStorage.clear();
    sessionStorage.clear();
    navigate('/landing');
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