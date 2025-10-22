import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
function Reel({ listOfVideos }) {
  const [videos, setVideos] = useState(listOfVideos);
  const videoRefs = useRef(new Map());
  const [isVideoPaused, setisVideoPaused] = useState(false);
  const [isActiveVideoId, setIsActiveVideoId] = useState(null);
  const [isIconDisplayed, setIsIconDisplayed] = useState(false);
  const [openCommentPanelId, setOpenCommentPanelId] = useState(null); // State for managing which comment panel is open
  const { addItemToCart } = useCart();
  // Observe videos after they are rendered
  useEffect(() => {
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
      observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [videos]);

  function handleClick() {
    if (!isActiveVideoId) return;
    const activeVideo = videoRefs.current.get(isActiveVideoId);
    if (!activeVideo) return;
    if (isVideoPaused) {
      activeVideo.play();
      setisVideoPaused(false);
      setIsIconDisplayed(true);
      setTimeout(() => {
        setIsIconDisplayed(false);
      }, 500);
    } else {
      activeVideo.pause();
      setisVideoPaused(true);
      setIsIconDisplayed(true);
      setTimeout(() => {
        setIsIconDisplayed(false);
      }, 500);
    }
  }

  async function handleLike(videoId, currentLikeStatus) {
    if (!isActiveVideoId) return;
    setVideos((currentVideos) =>
      currentVideos.map((video) =>
        video._id === videoId
          ? { ...video, likedByUser: !video.likedByUser }
          : video
      )
    );

    try {
      if (currentLikeStatus) {
        await axios.delete("http://localhost:8000/api/feature/like", {
          data: { videoId: videoId },
          withCredentials: true,
        });
        console.log("Video disliked:", currentLikeStatus);
      } else {
        await axios.post(
          "http://localhost:8000/api/feature/like",
          {
            videoId: videoId,
          },
          {
            withCredentials: true,
          }
        );
        console.log("Video liked:", currentLikeStatus);
      }
    } catch (error) {
      console.log(error);
      // Revert UI state if API call fails
      setVideos((currentVideos) =>
        currentVideos.map((video) =>
          video._id === videoId
            ? { ...video, likedByUser: !video.likedByUser }
            : video
        )
      );
    }
  }

  async function handleSave(videoId, currentSaveStatus) {
    if (!isActiveVideoId) return;
    setVideos((currentVideos) =>
      currentVideos.map((video) =>
        video._id === videoId
          ? { ...video, savedByUser: !video.savedByUser }
          : video
      )
    );

    try {
      if (currentSaveStatus) {
        await axios.delete("http://localhost:8000/api/feature/save", {
          data: { videoId: videoId },
          withCredentials: true,
        });
        console.log("Video removed from watchlist:", currentSaveStatus);
      } else {
        await axios.post(
          "http://localhost:8000/api/feature/save",
          {
            videoId: videoId,
          },
          {
            withCredentials: true,
          }
        );
        console.log("Video added to watchlist:", currentSaveStatus);
      }
    } catch (error) {
      console.log(error);
      // Revert UI state if API call fails
      setVideos((currentVideos) =>
        currentVideos.map((video) =>
          video._id === videoId
            ? { ...video, savedByUser: !video.savedByUser }
            : video
        )
      );
    }
  }
  const handleBuyClick = (e, item) => {
    e.stopPropagation();
    addItemToCart(item);
    alert(`${item.name} added to Cart`);
  };
  // Function to close the comment panel
  const closeCommentPanel = () => {
    setOpenCommentPanelId(null);
  };
  return (
    <div onClick={handleClick} className="relative h-screen overflow-hidden">
      {/* Backspace icon - sticky positioned */}
      <Link to={"/"}>
        <div className="fixed top-8 left-4 z-20">
          <ArrowLeft size={30} className="text-white" />
        </div>
      </Link>
      <div
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
        }}
      >
        {videos.map((item) => (
          <section
            key={item._id}
            style={{
              height: "100vh",
              width: "100%",
              position: "relative",
              scrollSnapAlign: "start",
            }}
          >
            {/* {Pause & Play} */}
            {isIconDisplayed && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-500 ease-in-out">
                {isVideoPaused ? (
                  <Play size={60} className="text-white" />
                ) : (
                  <Pause size={60} className=" text-white" />
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
                setisVideoPaused(true);
              }}
              onPlay={() => {
                setisVideoPaused(false);
              }}
              onClick={() => {
                setIsActiveVideoId(item._id);
                setisVideoPaused(false);
                setIsIconDisplayed(true);
                setTimeout(() => {
                  setIsIconDisplayed(false);
                }, 500);
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* Right-side action buttons */}
            <div className="absolute right-4 bottom-70 flex flex-col gap-5 items-center text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(item._id, item.likedByUser);
                }}
                className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition"
              >
                {item.likedByUser ? (
                  <FaHeart size={20} color="red" />
                ) : (
                  <FaHeart size={20} color="white" />
                )}
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition">
                <FaShareAlt size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent main div's handleClick
                  // Pause the video if playing
                  const videoElement = videoRefs.current.get(item._id);
                  if (videoElement && !videoElement.paused) {
                    videoElement.pause();
                  }
                  setOpenCommentPanelId(item._id); // Open panel for this video
                }}
                className="flex flex-col items-center gap-1 text-center z-20" // Ensure button is clickable
                aria-label="View comments"
              >
                <div className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/30 transition">
                  <FaCommentDots size={20} />
                </div>
                <span className="text-xs font-semibold">
                  {item.commentCount || 0}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(item._id, item.savedByUser);
                }}
                className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition"
              >
                {item.savedByUser ? (
                  <FaBookmark size={20} color="red" />
                ) : (
                  <FaBookmark size={20} color="white" />
                )}
              </button>
            </div>

            {/* Bottom info + buttons */}
            <div className="absolute bottom-12  w-full px-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/30"></div>
                <div className="px-4 py-2 rounded-xl bg-white/40 backdrop-blur-md border border-white/30 text-white font-body text-sm">
                  {item.description || "food-descrip"}
                </div>
                <p className="text-sm font-semibold flex justify-between items-center">
                  <span>{item.name}</span>{" "}
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
      <div className="fixed bottom-0 w-full px-8 py-2 flex justify-between items-center bg-black/30 backdrop-blur-md z-10">
        <Link to={"/"}>
          <FaHome size={24} className="text-white" />
        </Link>
        <Link to={"/profile"}>
          <FaUser size={24} className="text-white" />
        </Link>
      </div>

      {openCommentPanelId && (
        <CommentPanel
          foodId={openCommentPanelId}
          onClose={closeCommentPanel}
        />
      )}
    </div>
  );
}

export default Reel;
