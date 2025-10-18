import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FoodPartnerRegistration = () => {
  const [name, setRestaurantName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/foodPartner/register",
        {
          name,
          userName,
          email,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials:true
        }
      );

      setSuccessMsg("Registration successful!");
      console.log(successMsg);
      console.log(response);
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          setErrorMsg(
            "A user with this username or email already exists. Please choose different credentials."
          );
        } else if (error.response.status === 400) {
          setErrorMsg(error.response.data.message || "Invalid request.");
        } else {
          setErrorMsg(
            `Registration failed (status ${error.response.status}). Please try again later.`
          );
        }
      } else {
        setErrorMsg("Network error. Please ensure the server is running.");
      }
      console.log(errorMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-6 border rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-[#ef233c]">
          Food Partner Registration
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Restaurant Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#ef233c]"
              placeholder="Your Restaurant"
              value={name}
              onChange={(e) => setRestaurantName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#ef233c]"
              placeholder="Your Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#ef233c]"
              placeholder="partner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#ef233c]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-[#ef233c] rounded hover:bg-[#d01c33]"
          >
            Register
          </button>
        </form>
        <div className="text-center">
          <a
            href="/food-partner/login"
            className="text-sm text hover:underline"
          >
            Already have an account? Login here
          </a>
        </div>
      </div>
    </div>
  );
};
export default FoodPartnerRegistration;
