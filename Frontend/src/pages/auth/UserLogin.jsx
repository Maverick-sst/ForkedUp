import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/user/login",
        {
          userName,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // Store JWT token if returned (e.g., response.data.token)
      if (response.data && response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        // Set default Authorization header for future axios requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      }

      setSuccessMsg("Login successful!");
      console.log("Login response:", response);
      // Redirect to home page after successful login
      navigate("/feed");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMsg(error.response.data.message || "Invalid request.");
        } else {
          setErrorMsg(
            `login failed (status ${error.response.status}). Please try again later.`
          );
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-6 border rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-[#ef233c]">
          User Login
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            Login
          </button>
        </form>
        <div className="text-center">
          <a href="/user/register" className="text-sm text hover:underline">
            Don't have an account? Register here
          </a>
        </div>
      </div>
    </div>
  );
};
export default UserLogin;
