import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import axios from "axios";
import CartButton from "../../components/CartButton";
import BottomNav from "../../components/BottomNav";
import EditUserProfile from "./EditUserProfile";

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
    axios
      .get("http://localhost:8000/api/me", { withCredentials: true })
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
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, []);

  useEffect(() => {
    let endpoint = "";
    if (activeBtn === "liked") {
      endpoint =
        "http://localhost:8000/api/food/user/likedreels?page=1&limit=15";
    } else if (activeBtn === "savedreels") {
      endpoint =
        "http://localhost:8000/api/food/user/savedreels?page=1&limit=15";
    } else {
      setLikedReels([]);
      setSavedReels([]);
      return;
    }

    axios
      .get(endpoint, { withCredentials: true })
      .then((response) => {
        const reelsData = response.data?.reels || [];
        if (activeBtn === "liked") {
          setLikedReels(reelsData);
          setSavedReels([]);
        } else if (activeBtn === "savedreels") {
          setSavedReels(reelsData);
          setLikedReels([]);
        }
      })
      .catch((err) => {
        console.error(`Error fetching ${activeBtn} reels:`, err);
        setLikedReels([]);
        setSavedReels([]);
      });
  }, [activeBtn]);

  const handleVideoClick = (item, index, type) => {
    const reelList = type === "liked" ? likedReels : savedReels;
    navigate(`/profile/reels/${type}`, {
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
  if (showEditPanel) {
    // If showEditPanel is true, render only the EditUserProfile component
    return <EditUserProfile onClose={() => setShowEditPanel(false)} />;
  }

  return (
    <div className="relative flex flex-col h-full bg-brand-offwhite">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-4 z-20 text-brand-gray p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft size={28} />
      </button>

      {/* Settings button */}
      <button
        onClick={() => setShowEditPanel(true)}
        className="absolute top-7 right-4 z-20 text-brand-gray p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Edit Profile"
      >
        <Settings size={28} />
      </button>

      {/* Profile Header */}
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
          {loadingUser ? "Loading..." : userData.userName}
        </h2>

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

      <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-20 scrollbar-hide ">
        {activeBtn === "liked" && (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
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
            {likedReels.length === 0 && (
              <p className="col-span-3 text-center text-gray-500 mt-8">
                No liked reels yet.
              </p>
            )}
          </div>
        )}
        {activeBtn === "savedreels" && (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
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
            {savedReels.length === 0 && (
              <p className="col-span-3 text-center text-gray-500 mt-8">
                No saved reels yet.
              </p>
            )}
          </div>
        )}
        {activeBtn === "orders" && (
          <div className="text-center text-gray-500 mt-8">
            Order history coming soon!
          </div>
        )}
      </div>

      {!showEditPanel && <CartButton />}
      <BottomNav />
    </div>
  );
}

export default Profile;
