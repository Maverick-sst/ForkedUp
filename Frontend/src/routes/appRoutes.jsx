import React from "react";
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom'
import UserLogin from "../pages/auth/UserLogin";
import UserRegistration from "../pages/auth/UserRegistration";
import FoodPartnerLogin from "../pages/auth/FoodPartnerLogin";
import FoodPartnerRegistration from "../pages/auth/FoodPartnerRegistration";
import Feed from "../pages/user/Feed";
import Home from "../pages/user/Home"
import Profile from "../pages/user/Profile"
import Dashboard from "../pages/food-partner/Dashboard"
import CreateFood from "../pages/food-partner/CreateFood"
import FoodPartnerProfile from "../pages/food-partner/FoodPartnerProfile";

const AppRoutes=()=>{
    return(
        <Router>
            <Routes>
                <Route path="/user/register" element={<UserRegistration/>} />
                <Route path="/user/login" element={<UserLogin/>} />
                <Route path="/food-partner/register" element={<FoodPartnerRegistration/>} />
                <Route path="/food-partner/login" element={<FoodPartnerLogin/>} />
                <Route path="/feed" element={<Feed/>} />
                <Route path="/" element={<Home/>} />
                <Route path="/profile" element={<Profile/>} />

                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/add-food" element={<CreateFood/>} />
                <Route path="/food-partner/:id" element={<FoodPartnerProfile/>} />
                
            </Routes>
        </Router>
    )
}

export default AppRoutes;