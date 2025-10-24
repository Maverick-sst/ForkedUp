import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CartButton from "../../components/CartButton";
import BottomNav from "../../components/BottomNav";
import { FaSearch, FaTimes } from "react-icons/fa";
import SearchResultItem from "../../components/SearchResultItem";
import _ from "lodash";
import { FaUserCheck, FaUserPlus } from "react-icons/fa";
const FoodPartnerProfile = () => {
  const { id: partnerId } = useParams();
  const videoRefs = useRef(new Map());
  const [videos, setVideos] = useState([]);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  //  Search & Menu State
  const [showMenuSummary, setShowMenuSummary] = useState(false);
  const [menuSummary, setMenuSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const menuButtonRef = useRef(null);
  const summaryTimeoutRef = useRef(null);

  //  Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loadingFollowStatus, setLoadingFollowStatus] = useState(true);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  useEffect(() => {
    // Reset states when partnerId changes
    setShowSearchBar(false);
    setSearchTerm("");
    setSearchResults([]);
    setShowMenuSummary(false);
    setMenuSummary(null);
    setLoading(true);
    setLoadingFollowStatus(true);
    setIsFollowing(false);
    setFollowerCount(0);

    const fetchInitialData = async () => {
      try {
        // Fetch profile and follow status concurrently
        const [profileResponse, followStatusResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/food-partner/${partnerId}`, {
            withCredentials: true,
          }),
          axios.get(`http://localhost:8000/api/follow/status/${partnerId}`, {
            withCredentials: true,
          }),
        ]);

        // Process profile data
        if (profileResponse.data.foodPartner) {
          setProfile(profileResponse.data.foodPartner);
          setVideos(profileResponse.data.foodReels || []);
          // Set initial follower count from profile data
          setFollowerCount(profileResponse.data.foodPartner.followerCount || 0);
        } else {
          throw new Error("Partner profile not found in response.");
        }

        // Process follow status data
        setIsFollowing(followStatusResponse.data.isFollowing || false);
      } catch (err) {
        console.error(
          "Failed to fetch initial partner data or follow status:",
          err
        );
        setProfile(null);
        setVideos([]);
      } finally {
        setLoading(false);
        setLoadingFollowStatus(false);
      }
    };

    fetchInitialData();
  }, [partnerId]);

  const fetchMenuSummary = async () => {
    if (loadingSummary || menuSummary) return;

    setLoadingSummary(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/food-partner/${partnerId}/menu-summary`,
        { withCredentials: true }
      );
      setMenuSummary(response.data.summary);
    } catch (err) {
      console.error("Failed to fetch menu summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

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
      console.log(`Searching partner ${partnerId} for: ${query}`);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/food/search?q=${encodeURIComponent(
            query
          )}&partnerId=${partnerId}`,
          { withCredentials: true }
        );
        setSearchResults(response.data.results || []);
      } catch (err) {
        console.error("Partner search failed:", err);
        setSearchError("Search failed. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [partnerId]
  );
  //  Follow/Unfollow Toggle Handler
  const handleFollowToggle = async () => {
    if (isTogglingFollow || loadingFollowStatus) return;

    setIsTogglingFollow(true);
    const currentlyFollowing = isFollowing;

    // Optimistic UI Update
    setIsFollowing(!currentlyFollowing);
    setFollowerCount((prevCount) =>
      currentlyFollowing ? Math.max(0, prevCount - 1) : prevCount + 1
    );

    try {
      if (currentlyFollowing) {
        const response = await axios.delete(
          `http://localhost:8000/api/follow/${partnerId}`,
          { withCredentials: true }
        );

        if (response.data.followerCount !== undefined) {
          setFollowerCount(response.data.followerCount);
        }
      } else {
        const response = await axios.post(
          `http://localhost:8000/api/follow/${partnerId}`,
          {},
          { withCredentials: true }
        );

        if (response.data.followerCount !== undefined) {
          setFollowerCount(response.data.followerCount);
        }
      }
      console.log(
        `Successfully ${currentlyFollowing ? "unfollowed" : "followed"}`
      );
    } catch (error) {
      console.error("Error toggling follow:", error);

      setIsFollowing(currentlyFollowing);
      setFollowerCount((prevCount) =>
        currentlyFollowing ? prevCount + 1 : Math.max(0, prevCount - 1)
      );
      alert(
        `Failed to ${
          currentlyFollowing ? "unfollow" : "follow"
        }. Please try again.`
      );
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };

  const handleMenuMouseEnter = () => {
    clearTimeout(summaryTimeoutRef.current);
    fetchMenuSummary();
    setShowMenuSummary(true);
  };
  const handleMenuMouseLeave = () => {
    summaryTimeoutRef.current = setTimeout(() => {
      setShowMenuSummary(false);
    }, 300);
  };
  const handleSummaryMouseEnter = () => {
    clearTimeout(summaryTimeoutRef.current);
  };
  const handleSummaryMouseLeave = () => {
    setShowMenuSummary(false);
  };
  const handleMenuClick = () => {
    setShowSearchBar(!showSearchBar);
    setShowMenuSummary(false);
    setSearchTerm("");
    setSearchResults([]);
    setSearchError("");
  };

  const handleVideoClick = (foodId) => {
    navigate(`/food-partner/${partnerId}/${foodId}`);
  };
  const handleMouseEnter = (videoId) => {
    const video = videoRefs.current.get(videoId);
    if (video) {
      video.play().catch(() => {});
    }
  };
  const handleMouseLeave = (videoId) => {
    const video = videoRefs.current.get(videoId);
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };
  const setVideoRef = (el, id) => {
    if (el) videoRefs.current.set(id, el);
    else videoRefs.current.delete(id);
  };

  let timingString = "Timings not available";
  if (profile?.workingHours && profile.workingHours.length === 7) {
    const todayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday...
    const todaySchedule = profile.workingHours[todayIndex];

    // Helper function to format HH:MM to am/pm
    const formatTime = (time) => {
      if (!time) return "";
      const [hours, minutes] = time.split(":");
      let h = parseInt(hours, 10);
      const ampm = h >= 12 ? "pm" : "am";
      h = h % 12;
      h = h ? h : 12; // '0' hour (midnight) should be '12'
      return `${h}${minutes === "00" ? "" : `:${minutes}`}${ampm}`;
    };

    if (
      todaySchedule &&
      todaySchedule.isOpen &&
      todaySchedule.periods.length > 0
    ) {
      // Display the first time slot for the day
      const open = formatTime(todaySchedule.periods[0].openTime); //
      const close = formatTime(todaySchedule.periods[0].closeTime); //
      timingString = `Open: ${open} - ${close}`;
    } else if (todaySchedule && !todaySchedule.isOpen) {
      timingString = "Closed Today";
    }
  }

  if (loading) {
    return <div className="text-center p-10">Loading partner details...</div>;
  }
  if (!profile) {
    return (
      <div className="text-center p-10 text-red-500">
        Could not load partner profile.
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-4 font-sans pb-24">
      <div className="flex items-center justify-between mb-6">
        {/* Profile Pic and Restro Name */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
            <img
              src={
                profile.profilePhoto ||
                `https://ui-avatars.com/api/?name=${profile.name?.charAt(
                  0
                )}&background=random`
              }
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-heading text-2xl text-brand-gray font-semibold text-gray-800">
              {profile.name}
            </h1>
            <p className="text-sm text-gray-500">
              {profile.location?.address?.formatted || "Location not set"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {followerCount} Followers
            </p>
          </div>
        </div>
        {/* Rating */}
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">★</span>
          <span className="text-gray-700 font-medium">
            {profile.ratingAverage?.toFixed(1) || "N/A"}
          </span>
        </div>
      </div>

      {/* Follow button, Opening hours */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleFollowToggle}
          disabled={isTogglingFollow || loadingFollowStatus}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            isFollowing
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {loadingFollowStatus ? (
            <span>Loading...</span>
          ) : isFollowing ? (
            <>
              <FaUserCheck size={12} /> Following
            </>
          ) : (
            <>
              <FaUserPlus size={12} /> Follow
            </>
          )}
        </button>
        <p className="text-sm font-medium text-brand-orange">{timingString}</p>
      </div>

      <hr className="border-t border-gray-300 mb-6" />

      {/* Search Bar Area */}
      {showSearchBar && (
        <div className="mb-6 relative animate-fade-in">
          <input
            type="text"
            placeholder={`Search in ${profile.name}'s menu...`}
            className="w-full px-4 py-2 pl-10 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-brand-orange"
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <button
            onClick={() => {
              setSearchTerm("");
              setSearchResults([]);
              setSearchError("");
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Search Results Display */}
      {(isSearching || searchResults.length > 0 || searchError) && (
        <div className="mb-6 bg-gray-50 rounded-lg shadow-inner max-h-[50vh] overflow-y-auto p-4 border border-gray-200 space-y-3">
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
          {searchResults.map((item) => (
            <SearchResultItem key={item._id} item={item} />
          ))}
        </div>
      )}

      {/* Food Reels Grid - Hide if showing search results */}
      {!searchTerm.trim() && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-24">
          {videos.map((item) => (
            <div
              key={item._id.toString()}
              onMouseEnter={() => handleMouseEnter(item._id)}
              onMouseLeave={() => handleMouseLeave(item._id)}
              className="aspect-w-9 aspect-h-16 cursor-pointer group relative overflow-hidden rounded"
            >
              <video
                ref={(el) => setVideoRef(el, item._id)}
                src={item.video}
                muted
                playsInline
                loop
                preload="metadata"
                onClick={() => handleVideoClick(item._id)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            </div>
          ))}
          {videos.length === 0 && !loading && (
            <p className="col-span-full text-center text-gray-500 mt-8">
              No reels added by this partner yet.
            </p>
          )}
        </div>
      )}

      <CartButton positionClass="fixed bottom-24 right-4" />

      {/* Glassmorphism Menu Button */}
      <div
        ref={menuButtonRef}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20"
      >
        <button
          className="px-12 py-3 rounded-full bg-white/60 backdrop-blur-md text-gray-800 font-medium border border-white/30 shadow-lg transition hover:bg-white/80 flex items-center gap-2"
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
          onClick={handleMenuClick}
        >
          <FaSearch size={14} />
          Menu
        </button>
      </div>

      {/* Menu Summary Popover */}
      {showMenuSummary && menuButtonRef.current && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64 text-sm text-gray-700 z-30 transition-opacity duration-200 animate-fade-in"
          style={{
            bottom: `${menuButtonRef.current.offsetHeight + 10}px`,
            left: "50%",
            transform: "translateX(-50%)",
          }}
          onMouseEnter={handleSummaryMouseEnter}
          onMouseLeave={handleSummaryMouseLeave}
        >
          {loadingSummary && <p>Loading menu details...</p>}
          {menuSummary && (
            <div className="space-y-2">
              <h4 className="font-semibold border-b pb-1 mb-2 text-brand-gray">
                Menu Overview ({menuSummary.totalItems || 0} items)
              </h4>
              {menuSummary.categories?.length > 0 && (
                <div>
                  <p className="font-medium text-xs text-gray-500 uppercase">
                    Categories
                  </p>
                  <ul className="list-disc list-inside">
                    {menuSummary.categories.slice(0, 3).map((cat) => (
                      <li key={cat._id}>
                        {cat._id} ({cat.count})
                      </li>
                    ))}
                    {menuSummary.categories.length > 3 && <li>...and more</li>}
                  </ul>
                </div>
              )}
              {menuSummary.cuisines?.length > 0 && (
                <div>
                  <p className="font-medium text-xs text-gray-500 uppercase">
                    Cuisines
                  </p>
                  <ul className="list-disc list-inside">
                    {menuSummary.cuisines.slice(0, 3).map((cui) => (
                      <li key={cui._id} className="capitalize">
                        {cui._id} ({cui.count})
                      </li>
                    ))}
                    {menuSummary.cuisines.length > 3 && <li>...and more</li>}
                  </ul>
                </div>
              )}
            </div>
          )}
          {!loadingSummary && !menuSummary && <p>Could not load summary.</p>}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default FoodPartnerProfile;
