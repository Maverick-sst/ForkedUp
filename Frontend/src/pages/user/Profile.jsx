import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FaHome, FaUser } from "react-icons/fa";
import axios from "axios";
import CartButton from "../../components/CartButton";
import BottomNav from "../../components/BottomNav";
function Profile() {
  const [activeBtn, setActiveBtn] = useState("liked"); // default tab
  const [likedReels, setlikedReels] = useState([]);
  const [savedReels, setSavedReels] = useState([]);

  const videoRefs = useRef(new Map());
  // fetching reels upon mount
  useEffect(() => {
    switch (activeBtn) {
      case "liked":
        axios
          .get(
            "http://localhost:8000/api/food/user/likedreels?page=1&limit=15",
            {
              withCredentials: true,
            }
          )
          .then((response) => {
            if (response.data && response.data.reels) {
              setlikedReels(response.data.reels);
            } else {
              setlikedReels([]);
            }
          })
          .catch((err) => {
            console.log(err);
          });
        break;
      case "savedreels":
        console.log("savedreels selected");
        axios
          .get(
            "http://localhost:8000/api/food/user/savedreels?page=1&limit=15",
            {
              withCredentials: true,
            }
          )
          .then((response) => {
            if (response.data && response.data.reels) {
              setSavedReels(response.data.reels);
            } else {
              setSavedReels([]);
            }
          })
          .catch((err) => {
            console.log(err);
          });
        break;
      case "orders":
        break;
    }
  }, [activeBtn]);

  // to display reels in required grid
  // const handleVideoClick = (foodId) => {
  //   navigate(`/food-partner/${id}/${foodId}`);
  // };

  const handleMouseEnter = (videoId) => {
    const video = videoRefs.current.get(videoId);
    if (video) {
      video.play().catch((err) => {
        console.log("Autoplay prevented:", err);
      });
    }
  };

  const handleMouseLeave = (videoId) => {
    const video = videoRefs.current.get(videoId);
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };
  return (
    <div className="relative flex flex-col h-screen bg-brand-offwhite">
      {/* Back button */}
      <Link to={"/"}>
        <div className="fixed top-8 left-4 z-20">
          <ArrowLeft size={30} className="text-brand-grey" />
        </div>
      </Link>

      {/* Profile Header */}
      <div className="flex flex-col items-center pt-16 pb-6 px-6">
        {/* Circle profile pic */}
        <div className="w-30 h-30 rounded-full bg-brand-gray-light border border-brand-gray"></div>

        {/* Username */}
        <h2 className="mt-4 font-heading text-2xl text-brand-gray">username</h2>

        {/* Following count */}
        <p className="mt-2 text-gl text-brand-gray">
          following: <span className="font-semibold">x</span>
        </p>

        {/* Action buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setActiveBtn("liked")}
            className={`px-4 py-2 rounded-lg font-heading text-sm shadow transition ${
              activeBtn === "liked"
                ? "bg-brand-orange text-white"
                : "bg-brand-peach text-brand-gray hover:bg-brand-orange hover:text-white"
            }`}
          >
            liked reels
          </button>

          <button
            onClick={() => setActiveBtn("savedreels")}
            className={`px-4 py-2 rounded-lg font-heading text-sm shadow transition ${
              activeBtn === "savedreels"
                ? "bg-brand-orange text-white"
                : "bg-brand-peach text-brand-gray hover:bg-brand-orange hover:text-white"
            }`}
          >
            SavedReels
          </button>

          <button
            onClick={() => setActiveBtn("orders")}
            className={`px-4 py-2 rounded-lg font-heading text-sm shadow transition ${
              activeBtn === "orders"
                ? "bg-brand-orange text-white"
                : "bg-brand-peach text-brand-gray hover:bg-brand-orange hover:text-white"
            }`}
          >
            orders
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {activeBtn === "liked" && (
          // likedReels
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {likedReels.map((item) => (
              <div
                key={item._id.toString()}
                onMouseEnter={() => handleMouseEnter(item._id)}
                onMouseLeave={() => handleMouseLeave(item._id)}
                className="aspect-w-9 aspect-h-16"
              >
                <div className="w-full h-full bg-gray-200 rounded-lg">
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(item._id, el);
                      else videoRefs.current.delete(item._id);
                    }}
                    src={item.video} // backend field is `video`
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {activeBtn === "savedreels" && (
          // savedReels
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {savedReels.map((item) => (
              <div
                key={item._id.toString()}
                onMouseEnter={() => handleMouseEnter(item._id)}
                onMouseLeave={() => handleMouseLeave(item._id)}
                className="aspect-w-9 aspect-h-16"
              >
                <div className="w-full h-full bg-gray-200 rounded-lg">
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(item._id, el);
                      else videoRefs.current.delete(item._id);
                    }}
                    src={item.video} // backend field is `video`
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {activeBtn === "orders" && <div>no orders yet!</div>}
      </div>

      <CartButton />

      <BottomNav />
    </div>
  );
}

export default Profile;
