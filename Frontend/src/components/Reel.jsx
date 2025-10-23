// Frontend/src/components/Reel.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaUser,
  FaHeart,
  FaShareAlt,
  FaCommentDots,
  FaBookmark,
} from "react-icons/fa";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { useCart } from "../context/CartContext";
import CommentPanel from "./CommentPanel";
import BottomNav from "./BottomNav";

// Accept new props from Feed.jsx
function Reel({ listOfVideos, onLikeToggle, onSaveToggle, lastVideoRef }) {
  const [videos, setVideos] = useState(listOfVideos);
  const videoRefs = useRef(new Map());
  const navigate = useNavigate();
  const [isVideoPaused, setisVideoPaused] = useState(false);
  const [isActiveVideoId, setIsActiveVideoId] = useState(null);
  const [isIconDisplayed, setIsIconDisplayed] = useState(false);
  const [openCommentPanelId, setOpenCommentPanelId] = useState(null);
  const { addItemToCart } = useCart();

  // This is what allows the optimistic updates from Feed.jsx to work
  useEffect(() => {
    setVideos(listOfVideos);
  }, [listOfVideos]);

  // Observe videos after they are rendered
  useEffect(() => {
    // ... (IntersectionObserver logic remains exactly the same) ...
    if (videos.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => {});
            setIsActiveVideoId(video.dataset.id);
            setisVideoPaused(false);
          } else {
            video.pause();
            setisVideoPaused(true);
          }
        });
      },
      { threshold: [0.6] }
    );
    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
      observer.disconnect();
    };
  }, [videos]); // Still depends on internal videos state

  // handleClick remains the same
  function handleClick() {
    if (!isActiveVideoId) return;
    const activeVideo = videoRefs.current.get(isActiveVideoId);
    if (!activeVideo) return;
    if (isVideoPaused) {
      activeVideo.play();
      setisVideoPaused(false);
      setIsIconDisplayed(true);
      setTimeout(() => setIsIconDisplayed(false), 500);
    } else {
      activeVideo.pause();
      setisVideoPaused(true);
      setIsIconDisplayed(true);
      setTimeout(() => setIsIconDisplayed(false), 500);
    }
  }

  // --- UPDATED handleLike ---
  async function handleLike(videoId, currentLikeStatus) {
    if (!isActiveVideoId) return;

    // 1. Call parent's optimistic update function (if provided)
    if (onLikeToggle) {
      onLikeToggle(videoId, currentLikeStatus);
    } else {
      // Fallback for components that don't pass the handler (like Profile)
      // This internal update is now just a fallback
      setVideos((currentVideos) =>
        currentVideos.map((video) =>
          video._id === videoId
            ? { ...video, likedByUser: !video.likedByUser }
            : video
        )
      );
    }

    // 2. Make API call (as before)
    try {
      if (currentLikeStatus) {
        await axios.delete("http://localhost:8000/api/feature/like", {
          data: { videoId: videoId },
          withCredentials: true,
        });
      } else {
        await axios.post(
          "http://localhost:8000/api/feature/like",
          { videoId: videoId },
          { withCredentials: true }
        );
      }
    } catch (error) {
      console.log(error);
      // 3. Revert optimistic update on failure
      if (onLikeToggle) {
        onLikeToggle(videoId, !currentLikeStatus); // Reverts the change in parent
      } else {
        // Fallback revert
        setVideos((currentVideos) =>
          currentVideos.map((video) =>
            video._id === videoId
              ? { ...video, likedByUser: currentLikeStatus } // Revert to original
              : video
          )
        );
      }
    }
  }

  // --- UPDATED handleSave ---
  async function handleSave(videoId, currentSaveStatus) {
    if (!isActiveVideoId) return;

    // 1. Call parent's optimistic update function (if provided)
    if (onSaveToggle) {
      onSaveToggle(videoId, currentSaveStatus);
    } else {
      // Fallback
      setVideos((currentVideos) =>
        currentVideos.map((video) =>
          video._id === videoId
            ? { ...video, savedByUser: !video.savedByUser }
            : video
        )
      );
    }

    // 2. Make API call
    try {
      if (currentSaveStatus) {
        await axios.delete("http://localhost:8000/api/feature/save", {
          data: { videoId: videoId },
          withCredentials: true,
        });
      } else {
        await axios.post(
          "http://localhost:8000/api/feature/save",
          { videoId: videoId },
          { withCredentials: true }
        );
      }
    } catch (error) {
      console.log(error);
      // 3. Revert optimistic update on failure
      if (onSaveToggle) {
        onSaveToggle(videoId, !currentSaveStatus); // Revert in parent
      } else {
        // Fallback revert
        setVideos((currentVideos) =>
          currentVideos.map((video) =>
            video._id === videoId
              ? { ...video, savedByUser: currentSaveStatus } // Revert
              : video
          )
        );
      }
    }
  }

  // handleBuyClick and closeCommentPanel remain the same
  const handleBuyClick = (e, item) => {
    e.stopPropagation();
    addItemToCart(item);
    alert(`${item.name} added to Cart`);
  };

  const closeCommentPanel = () => {
    setOpenCommentPanelId(null);
  };

  return (
    <div onClick={handleClick} className="fixed h-screen overflow-hidden">
      {/* Backspace icon - sticky positioned */}
      <div className="fixed top-8 left-4 z-20">
        <ArrowLeft
          onClick={(e) => {
            e.stopPropagation();
            navigate(-1);
          }}
          size={30}
          className="text-white cursor-pointer"
        />
      </div>
      <div
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
        }}
      >
        {videos.map((item, index) => (
          <section
            ref={index === videos.length - 1 ? lastVideoRef : null}
            key={item._id}
            style={{
              height: "100vh",
              width: "100%",
              position: "relative",
              scrollSnapAlign: "start",
            }}
          >
            {/* {Pause & Play} */}
            {isIconDisplayed &&
              isActiveVideoId === item._id && ( // Only show on active video
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-500 ease-in-out z-10">
                  {isVideoPaused ? (
                    <Play size={49} fill="white" className="text-white/80" />
                  ) : (
                    <Pause size={49} fill="white" className="text-white/80" />
                  )}
                </div>
              )}

            {/* Reel video */}
            <video
              ref={(el) => {
                if (el) videoRefs.current.set(item._id, el);
                else videoRefs.current.delete(item._id);
              }}
              src={item.video}
              muted
              playsInline
              loop
              preload="metadata"
              data-id={item._id}
              onPause={() => {
                if (isActiveVideoId === item._id) setisVideoPaused(true);
              }}
              onPlay={() => {
                if (isActiveVideoId === item._id) setisVideoPaused(false);
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

            {/* Right-side action buttons */}
            <div className="absolute right-4 bottom-70 flex flex-col gap-5 items-center text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(item._id, item.likedByUser); // Use the prop
                }}
                className="flex flex-col items-center gap-1 text-center"
              >
                <div className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/30 transition">
                  {/* The UI now depends on the prop, which is updated optimistically */}
                  {item.likedByUser ? (
                    <FaHeart size={25} color="#FF4040" />
                  ) : (
                    <FaHeart size={25} color="white" />
                  )}
                </div>
                <span className="text-xs font-semibold">
                  {item.likeCount || 0}
                </span>
              </button>

              {/* Comment Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const videoElement = videoRefs.current.get(item._id);
                  if (videoElement && !videoElement.paused) {
                    videoElement.pause();
                  }
                  setOpenCommentPanelId(item._id);
                }}
                className="flex flex-col items-center gap-1 text-center z-20"
                aria-label="View comments"
              >
                <div className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/30 transition">
                  <FaCommentDots size={20} />
                </div>
                <span className="text-xs font-semibold">
                  {item.commentCount || 0}
                </span>
              </button>

              {/* Save Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(item._id, item.savedByUser); // Use the prop
                }}
                className="flex flex-col items-center gap-1 text-center"
              >
                <div className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/30 transition">
                  {/* UI depends on the prop */}
                  {item.savedByUser ? (
                    <FaBookmark size={25} color="#e78e3bff" />
                  ) : (
                    <FaBookmark size={25} color="white" />
                  )}
                </div>
              </button>

              {/* Share Button (no change) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Share clicked!");
                }}
                className="flex flex-col items-center gap-1 text-center"
              >
                <div className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/30 transition">
                  <FaShareAlt size={25} />
                </div>
              </button>
            </div>

            {/* Bottom info + buttons */}
            <div className="absolute bottom-16 md:bottom-12 left-0 w-full px-4 flex flex-col gap-3 z-10">
              <div className="flex flex-col gap-1 text-white">
                <Link
                  to={`/food-partner/${item.foodPartner}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-white/30 flex-shrink-0">
                    {/* Partner profile image */}
                  </div>
                  <span className="font-semibold text-sm group-hover:underline">
                    FoodPartnerName
                  </span>
                </Link>
                <p className="text-xs line-clamp-2">
                  {item.description || "Delicious food reel!"}
                </p>
                {/* Price Display */}
                <p className="text-sm font-semibold flex justify-between items-center">
                  <span>{item.name}</span>
                  <span className="text-brand-orange font-bold">
                    ₹{item.price?.toFixed(2)}
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={(e) => handleBuyClick(e, item)}
                  className="flex-1 py-2 rounded-xl bg-brand-green text-white font-heading shadow hover:opacity-90"
                >
                  Add To Cart
                </button>
                <Link
                  to={"/food-partner/" + item.foodPartner}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1"
                >
                  <button className="w-full py-2 rounded-xl bg-brand-orange text-white font-heading shadow hover:bg-brand-peach">
                    Explore
                  </button>
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Sticky bottom navigation bar */}
      <BottomNav />

      {/* Comment Panel remains the same */}
      {openCommentPanelId && (
        <CommentPanel foodId={openCommentPanelId} onClose={closeCommentPanel} />
      )}
    </div>
  );
}

export default Reel;
