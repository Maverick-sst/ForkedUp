// Frontend/src/pages/user/Home.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useGeoLocation } from "../../hooks/useGeoLocation";
import { Link } from "react-router-dom";
import CartButton from "../../components/CartButton";
import axios from "axios";
import BottomNav from "../../components/BottomNav";
import SearchResultItem from "../../components/SearchResultItem"; // Import the new component
import _ from "lodash"; // Import lodash for debouncing

function Home() {
  const { location, status, requestLocation } = useGeoLocation();
  const [address, setAddress] = useState(() => {
    const savedAddress = localStorage.getItem("userAddress");
    return savedAddress || "";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (!address && status !== "denied") {
      requestLocation();
    }
  }, [address, requestLocation, status]); // Added status dependency

  useEffect(() => {
    if (status === "ready" && location) {
      axios
        .get(
          `http://localhost:8000/api/location/reverse-geocode?lat=${location.lat}&lng=${location.lng}`
        )
        .then((res) => {
          if (!res?.data?.address) return; // Safer check
          setAddress(res.data.address);
          localStorage.setItem("userAddress", res.data.address);
        })
        .catch((err) => {
          console.error("Error fetching address:", err); // Log error
        });
    }
  }, [location, status]);

  // --- Debounced Search Function ---
  const debouncedSearch = useCallback(
    _.debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        setSearchError("");
        return;
      }
      setIsSearching(true);
      setSearchError("");
      console.log(`Searching globally for: ${query}`);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/food/search?q=${encodeURIComponent(
            query
          )}`,
          { withCredentials: true }
        );
        setSearchResults(response.data.results || []);
      } catch (err) {
        console.error("Global search failed:", err);
        setSearchError("Search failed. Please try again.");
        setSearchResults([]); // Clear results on error
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  // --- Handle Search Input Change ---
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };

  return (
    <div className="relative h-screen w-full bg-white text-black overflow-hidden">
      {/* Background overlay video */}
      <video
        src="/sample-bg.mp4" // replace with actual video path
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top bar: location + user profile */}
        <div className="flex justify-between items-center px-4 py-4 bg-white/70 backdrop-blur-md rounded-b-xl shadow">
          <div className="text-sm px-3 py-1 rounded-lg border">
            {status === "ready" || address
              ? address
              : status === "loading"
              ? "Detecting..."
              : status === "denied"
              ? "Location blocked"
              : "Set location"}
            {status !== "ready" &&
              status !== "loading" &&
              !address && ( // Show button only if needed
                <button
                  onClick={requestLocation}
                  className="ml-2 px-2 py-0.5 rounded text-xs bg-brand-orange text-white"
                >
                  Detect
                </button>
              )}
          </div>
          <Link to="/profile">Hey, Username</Link>{" "}
          {/* TODO: Fetch actual username */}
        </div>

        {/* Search bar */}
        <div className="px-4 mt-4 relative">
          <input
            type="text"
            placeholder="Search dish or restaurant..."
            className="w-full px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-gray-300 placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-brand-orange"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Search Results */}
        {(isSearching || searchResults.length > 0 || searchError) && (
          <div className="absolute top-32 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-lg shadow-lg max-h-[60vh] overflow-y-auto p-4 border border-gray-200">
            {isSearching && (
              <p className="text-center text-gray-500 py-2">Searching...</p>
            )}
            {searchError && (
              <p className="text-center text-red-500 py-2">{searchError}</p>
            )}
            {!isSearching &&
              searchResults.length === 0 &&
              searchTerm.trim() &&
              !searchError && (
                <p className="text-center text-gray-500 py-2">
                  No results found for "{searchTerm}"
                </p>
              )}
            <div className="space-y-3">
              {searchResults.map((item) => (
                <SearchResultItem key={item._id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Centered Explore Feed button - Hide if searching/results shown */}
        {!(isSearching || searchResults.length > 0 || searchTerm.trim()) && (
          <div className="flex-1 flex items-center justify-center">
            <Link to="/feed">
              <button className="px-6 py-3 rounded-xl bg-brand-orange text-black font-heading shadow hover:bg-brand-peach transition">
                Explore Feed
              </button>
            </Link>
          </div>
        )}

        <CartButton />
        <BottomNav />
      </div>
    </div>
  );
}

export default Home;
