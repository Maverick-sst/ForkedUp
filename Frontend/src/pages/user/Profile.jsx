import { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import axios from "axios";
import CartButton from "../../components/CartButton";
import BottomNav from "../../components/BottomNav";
import EditUserProfile from "./EditUserProfile";
import OrderSummary from "../../components/OrderSummary";
import LoadingComponent from "../../components/LoadingComponent";
// import { useAuth } from "../../context/AuthContext";
import { handleLogout } from "../../utilities/authUtils";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// const { authState } = useAuth();
function Profile() {
  const [activeBtn, setActiveBtn] = useState("liked");
  const [likedReels, setLikedReels] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const [userData, setUserData] = useState({
    userName: "username",
    profilePhoto: null,
  });
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();
  const videoRefs = useRef(new Map());
  const [showEditPanel, setShowEditPanel] = useState(false);

  useEffect(() => {
    setLoadingUser(true);
    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 1800));
    axios
      .get(`${apiUrl}/api/me`, { withCredentials: true })
      .then((response) => {
        if (response.data?.user) {
          setUserData({
            userName: response.data.user.userName || "username",
            profilePhoto: response.data.user.profilePhoto,
          });
        } else {
          setUserData({ userName: "username", profilePhoto: null });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user data:", err);
        setUserData({ userName: "username", profilePhoto: null });
      })
      .finally(() => {
        minLoadingTime.then(() => {
          setLoadingUser(false);
        });
      });
  }, []);

  useEffect(() => {
    if (activeBtn === "orders") {
      setLikedReels([]);
      setSavedReels([]);
      return;
    }

    let endpoint = "";

    setLikedReels([]);
    setSavedReels([]);

    if (activeBtn === "liked") {
      endpoint =
        `${apiUrl}/api/food/user/likedreels?page=1&limit=15`;
    } else if (activeBtn === "savedreels") {
      endpoint =
        `${apiUrl}/api/food/user/savedreels?page=1&limit=15`;
    } else {
      return;
    }

    // Fetch Liked/Saved (existing logic)
    if (endpoint) {
      axios
        .get(endpoint, { withCredentials: true })
        .then((response) => {
          const reelsData = response.data?.reels || [];
          if (activeBtn === "liked") {
            setLikedReels(reelsData);
          } else if (activeBtn === "savedreels") {
            setSavedReels(reelsData);
          }
        })
        .catch((err) => {
          console.error(`Error fetching ${activeBtn} reels:`, err);
        });
    }
  }, [activeBtn]); // Re-run only when activeBtn changes
  const handleVideoClick = (item, index, type) => {
    const reelList = type === "liked" ? likedReels : savedReels;
    navigate(`/profile/reels/${type === "liked" ? "liked" : "saved"}`, {
      state: { reels: reelList, startIndex: index },
    });
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
  if (loadingUser) {
    return <LoadingComponent message="Loading Profile..." minDuration={1800} />;
  }
  if (showEditPanel) {
    return <EditUserProfile onClose={() => setShowEditPanel(false)} />;
  }

  return (
    <div className="relative flex flex-col h-full bg-brand-offwhite">
      {/* Back & Settings Buttons (no changes) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-4 z-20 text-brand-gray p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={28} />
      </button>

      <button
        onClick={() => {
          if (window.confirm("Are you sure you want to logout?")) {
            handleLogout(navigate,"user");
          }
        }}
        className="absolute top-7 right-16 z-20 text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
        aria-label="Logout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>

      <button
        onClick={() => setShowEditPanel(true)}
        className="absolute top-7 right-4 z-20 text-brand-gray p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Edit Profile"
      >
        <Settings size={28} />
      </button>

      {/* Profile Header (no changes) */}
      <div className="flex flex-col items-center pt-16 pb-6 px-6">
        <div className="w-33 h-33 rounded-full bg-brand-gray-light border-2 border-brand-gray overflow-hidden shadow-md">
          <img
            src={
              userData.profilePhoto ||
              `https://ui-avatars.com/api/?name=${
                userData.userName?.charAt(0) || "U"
              }&background=random&color=fff&size=96`
            }
            alt={`${userData.userName}'s profile`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${
                userData.userName?.charAt(0) || "U"
              }&background=random&color=fff&size=96`;
            }}
          />
        </div>
        <h2 className="mt-4 font-heading text-2xl text-brand-gray">
          {userData.userName}
        </h2>
        {/* Filter Buttons (no changes) */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <button
            onClick={() => setActiveBtn("liked")}
            className={`px-4 py-1.5 rounded-full font-heading text-xs shadow transition ${
              activeBtn === "liked"
                ? "bg-brand-orange text-white"
                : "bg-white text-brand-gray hover:bg-gray-100"
            }`}
          >
            Liked
          </button>
          <button
            onClick={() => setActiveBtn("savedreels")}
            className={`px-4 py-1.5 rounded-full font-heading text-xs shadow transition ${
              activeBtn === "savedreels"
                ? "bg-brand-orange text-white"
                : "bg-white text-brand-gray hover:bg-gray-100"
            }`}
          >
            Saved
          </button>
          <button
            onClick={() => setActiveBtn("orders")}
            className={`px-4 py-1.5 rounded-full font-heading text-xs shadow transition ${
              activeBtn === "orders"
                ? "bg-brand-orange text-white"
                : "bg-white text-brand-gray hover:bg-gray-100"
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-20 scrollbar-hide ">
        {/* Liked Reels */}
        {activeBtn === "liked" && (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {likedReels.length === 0 && (
              <p className="col-span-3 text-center text-gray-500 mt-8">
                No liked reels yet.
              </p>
            )}
            {likedReels.map((item, index) => (
              <div
                key={item._id}
                onClick={() => handleVideoClick(item, index, "liked")}
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 "
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
              </div>
            ))}
          </div>
        )}

        {/* Saved Reels  */}
        {activeBtn === "savedreels" && (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {savedReels.length === 0 && (
              <p className="col-span-3 text-center text-gray-500 mt-8">
                No saved reels yet.
              </p>
            )}
            {savedReels.map((item, index) => (
              <div
                key={item._id}
                onClick={() => handleVideoClick(item, index, "saved")}
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
              </div>
            ))}
          </div>
        )}

        {/*  Orders Section - Render OrderSummary component */}
        {activeBtn === "orders" && <OrderSummary />}
      </div>

      {/* Cart Button & Bottom Nav (no changes) */}
      {!showEditPanel && <CartButton />}
      <BottomNav />
    </div>
  );
}

export default Profile;
