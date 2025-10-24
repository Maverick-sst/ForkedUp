import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserRegistration = () => {
  const [name, setName] = useState("");
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

      setSuccessMsg("Registration successful!");
      console.log(response);
      navigate("/feed");
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
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-offwhite">
      <div className="w-full max-w-md p-8 space-y-6 border rounded shadow-md">
        <h1 className="font-heading text-2xl text-brand-gray">
          User Registration
        </h1>

        {successMsg && (
          <div className="p-2 mb-4 text-green-700 bg-green-100 border border-green-300 rounded">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-2 mb-4 text-red-700 bg-red-100 border border-red-300 rounded">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-brand-orange"
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
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder="you@example.com"
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
              className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-brand-orange rounded hover:bg-brand-peach hover:text-brand-gray
"
          >
            Register
          </button>
        </form>

        <div className="text-center">
          <a href="/user/login" className="text-sm hover:underline">
            Already have an account? Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
