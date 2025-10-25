import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaShareAlt, FaCommentDots, FaBookmark } from "react-icons/fa";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { useCart } from "../context/CartContext";
import CommentPanel from "./CommentPanel";
import BottomNav from "./BottomNav";
import { useNotification } from "./Notification";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
  const [partnerInfoMap, setPartnerInfoMap] = useState({}); // { partnerId: { name, profilePhoto } }
  const {showNotification} = useNotification();
  useEffect(() => {
    setVideos(listOfVideos);
  }, [listOfVideos]);

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
      if (video) observer.observe(video);
    });
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
      observer.disconnect();
    };
  }, [videos]);

  useEffect(() => {
    // Only proceed if there are videos
    if (!videos || videos.length === 0) return;

    // 1. Get unique partner IDs from the current videos list that are not yet fetched
    const uniquePartnerIds = [
      ...new Set(videos.map((v) => v.foodPartner).filter(Boolean)),
    ];
    // Also validate ID format and check if already fetched
    const idsToFetch = uniquePartnerIds.filter(
      (id) => id && !partnerInfoMap[id] && /^[0-9a-fA-F]{24}$/.test(id)
    );

    // 2. If no new partners to fetch, exit early
    if (idsToFetch.length === 0) return;

    // 3. Define the async function to fetch a single partner's data
    const fetchPartner = async (id) => {
      try {
        console.log(`Fetching partner details for ID: ${id}`); // Log fetching attempt
        // Use the correct endpoint structure: /api/food-partner/:id
        const res = await axios.get(
          `${apiUrl}/api/food-partner/${id}`,
          { withCredentials: true }
        );
        // Access nested partner data correctly based on controller response
        const partnerData = res.data?.foodPartner;
        if (partnerData) {
          // Return an object with id, name, and profilePhoto
          return {
            id,
            name: partnerData.name || "Partner",
            profilePhoto: partnerData.profilePhoto,
          };
        }
        console.warn(`Partner data missing in response for ID: ${id}`);
        return { id, name: "Partner N/A", profilePhoto: null }; // Handle missing data
      } catch (e) {
        console.error("Failed to fetch partner", id, e);
        // Return fallback data on error
        return { id, name: "Partner Error", profilePhoto: null };
      }
    };

    // 4. Fetch details for all missing partners concurrently
    Promise.all(idsToFetch.map(fetchPartner))
      .then((results) => {
        // Create a map of the newly fetched data
        const newPartnerData = results.reduce((acc, p) => {
          if (p) acc[p.id] = { name: p.name, profilePhoto: p.profilePhoto };
          return acc;
        }, {});
        // 5. Update the partnerInfoMap state, merging new data with existing
        setPartnerInfoMap((prevMap) => ({ ...prevMap, ...newPartnerData }));
        console.log("Updated partnerInfoMap:", newPartnerData); // Log updates
      })
      .catch((err) => {
        console.error("Error processing partner fetch results:", err); // Catch errors in Promise.all
      });

    // 6. Dependency: Re-run this effect if the `videos` list changes or partnerInfoMap updates.
  }, [videos, partnerInfoMap]);

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
        await axios.delete(`${apiUrl}/api/feature/like`, {
          data: { videoId: videoId },
          withCredentials: true,
        });
      } else {
        await axios.post(
          `${apiUrl}/api/feature/like`,
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
        await axios.delete(`${apiUrl}/api/feature/save`, {
          data: { videoId: videoId },
          withCredentials: true,
        });
      } else {
        await axios.post(
          `${apiUrl}/api/feature/save`,
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

  // handleBuyClick and closeCommentPanel
  const handleBuyClick = (e, item) => {
    e.stopPropagation();
    if (!item) return;
    const itemToAdd = {
      foodId: item._id,
      name: item.name,
      price: item.price,
      foodPartner: item.foodPartner,
      videoUrl: item.video,
    };
    addItemToCart(itemToAdd);
    // alert(`${item.name} added to Cart`);
    showNotification(`${item.name} added to Cart`)
  };
  const handleCommentClick = (e, videoId) => {
    e.stopPropagation();
    const videoElement = videoRefs.current.get(videoId);
    // If the video exists and is currently playing, pause it before opening comments
    if (videoElement && !videoElement.paused) {
      videoElement.pause();
      // Manually update the pause state if this is the active video
      if (videoId === isActiveVideoId) {
        setisVideoPaused(true); // Explicitly set state as observer might not catch this immediately
      }
    }
    // Set the state to open the CommentPanel for the specific videoId
    setOpenCommentPanelId(videoId);
  };
  const closeCommentPanel = () => {
    setOpenCommentPanelId(null);
  };

  return (
    <div
      onClick={handleClick}
      className="absolute inset-0 bg-black overflow-hidden flex flex-col"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(-1);
        }}
        className="absolute top-4 left-4 z-30 text-white p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors" // Adjusted styling & z-index
        aria-label="Go back"
      >
        <ArrowLeft size={24} />
      </button>
      <div className="flex-grow w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative">
        {videos.map((item, index) => {
          const partnerInfo = partnerInfoMap[item.foodPartner] || {
            name: "Loading...",
            profilePhoto: null,
          };
          const likeCount =
            typeof item.likeCount === "number" ? item.likeCount : 0;
          const commentCount =
            typeof item.commentCount === "number" ? item.commentCount : 0;

          return (
            <section
              ref={index === videos.length - 1 ? lastVideoRef : null}
              key={item._id}
              className="h-full w-full relative snap-start flex items-center justify-center bg-black"
              aria-label={`Reel for ${item.name || "food item"}`}
            >
              {/* {Pause & Play} */}
              {isIconDisplayed && isActiveVideoId === item._id && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-500 ease-in-out z-10 animate-fade-in-out ml-10">
                  <div className="bg-black/50 p-4 rounded-full">
                    {isVideoPaused ? (
                      <Play size={49} fill="white" className="text-white/90" />
                    ) : (
                      <Pause size={49} fill="white" className="text-white/90" />
                    )}
                  </div>
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
                className="w-full h-full object-cover block"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

              {/* Right-side action buttons */}
              <div className="absolute right-4 bottom-50 flex flex-col gap-5 items-center text-white">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(item._id, item.likedByUser);
                  }}
                  className="flex flex-col items-center gap-1 text-center group"
                  aria-label={item.likedByUser ? "Unlike" : "Like"}
                >
                  <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full group-hover:bg-white/20 transition duration-200">
                    <FaHeart
                      size={24}
                      color={item.likedByUser ? "#FF4040" : "white"}
                      className={`transition-transform duration-200 ${
                        item.likedByUser ? "scale-110" : "group-hover:scale-110"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold drop-shadow-md">
                    {likeCount}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCommentClick(e, item._id);
                  }}
                  className="flex flex-col items-center gap-1 text-center group z-20" // Added group class
                  aria-label="View comments"
                >
                  <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full group-hover:bg-white/20 transition duration-200">
                    <FaCommentDots
                      size={22}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>
                  <span className="text-xs font-semibold drop-shadow-md">
                    {commentCount}
                  </span>
                </button>

                {/* Save Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(item._id, item.savedByUser);
                  }}
                  className="flex flex-col items-center gap-1 text-center group"
                  aria-label={item.savedByUser ? "Unsave" : "Save"}
                >
                  <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full group-hover:bg-white/20 transition duration-200">
                    <FaBookmark
                      size={23}
                      color={item.savedByUser ? "#FFB703" : "white"}
                      className={`transition-transform duration-200 ${
                        item.savedByUser ? "scale-110" : "group-hover:scale-110"
                      }`}
                    />
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert("Share clicked!");
                  }}
                  className="flex flex-col items-center gap-1 text-center group"
                  aria-label="Share"
                >
                  <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full group-hover:bg-white/20 transition duration-200">
                    <FaShareAlt
                      size={22}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>
                </button>
              </div>

              {/* Bottom info + buttons */}

              <div className="absolute bottom-16 md:bottom-12 left-0 w-full px-4 flex flex-col gap-3 z-20">
                <div className="flex flex-col gap-1 text-white text-shadow">
                  <Link
                    to={`/food-partner/${item.foodPartner}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 group w-fit"
                  >
                    <img
                      src={
                        partnerInfo.profilePhoto ||
                        `https://ui-avatars.com/api/?name=${(
                          partnerInfo.name || "P"
                        ).charAt(0)}&background=random&color=fff&size=32`
                      }
                      alt={partnerInfo.name}
                      className="w-11 h-11 rounded-full object-cover border border-white/30 flex-shrink-0 bg-gray-500"
                    />

                    <span className="font-semibold text-xl group-hover:underline">
                      {partnerInfo.name}
                    </span>
                  </Link>
                  <p className="text-l line-clamp-2">
                    {item.description || " "}
                  </p>

                  <p className="text-lg font-semibold flex justify-between items-center mt-1">
                    <span>{item.name}</span>
                    <span className="text-brand-orange text-lg font-bold text-base">
                      ₹{item.price?.toFixed(2)}
                    </span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={(e) => handleBuyClick(e, item)}
                    className="flex-1 py-2.5 rounded-lg bg-brand-green text-white font-semibold text-sm shadow hover:opacity-90 active:scale-95 transition"
                  >
                    Add To Cart
                  </button>
                  <Link
                    to={"/food-partner/" + item.foodPartner}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1"
                  >
                    <button className="w-full py-2.5 rounded-lg bg-brand-orange text-white font-semibold text-sm shadow hover:bg-brand-peach hover:text-black active:scale-95 transition">
                      Explore Partner
                    </button>
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Sticky bottom navigation bar */}
      {!openCommentPanelId && <BottomNav />}

      {/* Comment Panel remains the same */}
      {openCommentPanelId && (
        <CommentPanel foodId={openCommentPanelId} onClose={closeCommentPanel} />
      )}
    </div>
  );
}

export default Reel;
