import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import LandingPage from "../pages/LandingPage/LandingPage.jsx";
import UserLogin from "../pages/auth/UserLogin.jsx";
import UserRegistration from "../pages/auth/UserRegistration.jsx";
import FoodPartnerLogin from "../pages/auth/FoodPartnerLogin.jsx";
import FoodPartnerRegistration from "../pages/auth/FoodPartnerRegistration.jsx";
import Feed from "../pages/user/Feed.jsx";
import Home from "../pages/user/Home.jsx";
import Profile from "../pages/user/Profile.jsx";
import Dashboard from "../pages/food-partner/Dashboard.jsx";
import CreateFood from "../pages/food-partner/CreateFood.jsx";
import FoodPartnerProfile from "../pages/user/FoodPartnerProfile.jsx";
import PartnerProfile from "../pages/food-partner/partnerProfile.jsx";
import FoodPartnerReels from "../pages/user/FoodPartnerReels.jsx";
import CartPage from "../pages/user/CartPage.jsx";
import CheckoutPage from "../pages/user/CheckoutPage.jsx";
import OrderSuccessPage from "../pages/user/OrderSuccessPage.jsx";
import UserProfileReelsViewer from "../components/UserProfileReelsViewer.jsx";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage.jsx";
import UnauthorizedPage from "../pages/NotFoundPage/UnauthorizedPage.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const RedirectIfLoggedIn = ({ children }) => {
  const { authState } = useAuth();
  if (authState.isAuthenticated) {
    // Redirect based on role
    return (
      <Navigate
        to={authState.role === "foodpartner" ? "/dashboard" : "/"}
        replace
      />
    );
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/landing" element={<LandingPage />} />
        {/* Redirect logged-in users away from login/register */}
        <Route
          path="/user/register"
          element={
            <RedirectIfLoggedIn>
              <UserRegistration />
            </RedirectIfLoggedIn>
          }
        />
        <Route
          path="/user/login"
          element={
            <RedirectIfLoggedIn>
              <UserLogin />
            </RedirectIfLoggedIn>
          }
        />
        <Route
          path="/food-partner/register"
          element={
            <RedirectIfLoggedIn>
              <FoodPartnerRegistration />
            </RedirectIfLoggedIn>
          }
        />
        <Route
          path="/food-partner/login"
          element={
            <RedirectIfLoggedIn>
              <FoodPartnerLogin />
            </RedirectIfLoggedIn>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* --- Protected Routes --- */}
        {/* Wrap all protected routes within a single ProtectedRoute element */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/profile/reels/liked"
            element={<UserProfileReelsViewer />}
          />
          <Route
            path="/profile/reels/saved"
            element={<UserProfileReelsViewer />}
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/order-success/:orderId"
            element={<OrderSuccessPage />}
          />
          <Route path="/food-partner/:id" element={<FoodPartnerProfile />} />
          <Route
            path="/food-partner/:id/:foodId"
            element={<FoodPartnerReels />}
          />

          {/* Routes accessible by logged-in FOOD PARTNERS */}

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-food" element={<CreateFood />} />
          <Route
            path="/food-partner/profile/edit"
            element={<PartnerProfile />}
          />
        </Route>

        {/* --- 404 Route --- */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
