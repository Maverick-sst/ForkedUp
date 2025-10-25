import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import UserLogin from "../pages/auth/UserLogin";
import UserRegistration from "../pages/auth/UserRegistration";
import FoodPartnerLogin from "../pages/auth/FoodPartnerLogin";
import FoodPartnerRegistration from "../pages/auth/FoodPartnerRegistration";
import Feed from "../pages/user/Feed";
import Home from "../pages/user/Home";
import Profile from "../pages/user/Profile";
import Dashboard from "../pages/food-partner/Dashboard";
import CreateFood from "../pages/food-partner/CreateFood";
import FoodPartnerProfile from "../pages/user/FoodPartnerProfile";
import PartnerProfile from "../pages/food-partner/partnerProfile";
import FoodPartnerReels from "../pages/user/FoodPartnerReels";
import CartPage from "../pages/user/CartPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import OrderSuccessPage from "../pages/user/OrderSuccessPage";
import UserProfileReelsViewer from "../components/UserProfileReelsViewer";
import NotFoundPage from "../pages/NotFoundPage";
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/user/register" element={<UserRegistration />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route
          path="/food-partner/register"
          element={<FoodPartnerRegistration />}
        />
        <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/" element={<Home />} />

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
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-food" element={<CreateFood />} />
        <Route path="/food-partner/:id" element={<FoodPartnerProfile />} />
        <Route
          path="/food-partner/:id/:foodId"
          element={<FoodPartnerReels />}
        />
        <Route path="/food-partner/profile/edit" element={<PartnerProfile />} />
         <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
