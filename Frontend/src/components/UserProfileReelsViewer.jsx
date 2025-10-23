import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaShareAlt, FaCommentDots, FaBookmark } from "react-icons/fa";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { useCart } from "../context/CartContext"; // Corrected path
import CommentPanel from "./CommentPanel"; // Corrected path
import BottomNav from "./BottomNav"; // Corrected path

// This component now behaves very similarly to Reel.jsx
// It accepts listOfVideos from location state and manages interactions internally
// It does NOT use optimistic update props like onLikeToggle/onSaveToggle from a parent

function UserProfileReelsViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addItemToCart } = useCart();
  // Use Sets for interaction state, mirroring Feed.jsx
const [likedSet, setLikedSet] = useState(new Set());
const [savedSet, setSavedSet] = useState(new Set());
  // Get reels and starting point from navigation state
  const initialReels = location.state?.reels || [];
  const startIndex = location.state?.startIndex || 0;

  // Local state for videos, mirroring the structure in Reel.jsx
  const [videos, setVideos] = useState(initialReels);
  const [isVideoPaused, setIsVideoPaused] = useState(true); // Start paused
  const [isActiveVideoId, setIsActiveVideoId] = useState(null);
  const [isIconDisplayed, setIsIconDisplayed] = useState(false);
  const [openCommentPanelId, setOpenCommentPanelId] = useState(null);
  const [partnerInfoMap, setPartnerInfoMap] = useState({});

  const videoRefs = useRef(new Map());
  const containerRef = useRef(null);
  const initialScrollDone = useRef(false);
  const observer = useRef(); // Store observer instance in ref
  // --- Fetch Interactions on Initial Load ---
// Fetch like/save status for all videos passed in state
useEffect(() => {
    const fetchInitialInteractions = async () => {
        // Ensure initialReels is populated and not empty
        if (!initialReels || initialReels.length === 0) {
            console.log("No initial reels to fetch interactions for.");
            return;
        }
        // Get valid video IDs
        const videoIds = initialReels
            .map((v) => v?._id) // Safely access _id
            .filter(id => id && /^[0-9a-fA-F]{24}$/.test(id)) // Filter out invalid/missing IDs
            .join(",");

        if (!videoIds) {
            console.log("No valid video IDs found to fetch interactions.");
            return; // Stop if no valid IDs
        }

        console.log(`Fetching initial interactions for video IDs: ${videoIds}`);
        try {
            const res = await axios.get(
                `http://localhost:8000/api/feature/interactions?ids=${videoIds}`,
                { withCredentials: true }
            );
            const { liked, saved } = res.data;
            // Initialize the sets with fetched IDs
            setLikedSet(new Set(liked || [])); // Ensure liked/saved are arrays
            setSavedSet(new Set(saved || []));
            console.log("Initial interactions fetched:", { liked: liked?.length, saved: saved?.length });
        } catch (err) {
            console.error("Failed to fetch initial interactions:", err);
            // Handle error appropriately - maybe show a message or just log it
            // For now, sets will remain empty on error
        }
    };
    fetchInitialInteractions();
// Run only once when the component mounts based on the initial list
}, [initialReels]);


  // Fetch Partner Info (Same as previous version)
  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!videos || videos.length === 0) return;
      const partnerIds = [
        ...new Set(
          videos
            .map((v) => v.foodPartner)
            .filter((id) => !!id && /^[0-9a-fA-F]{24}$/.test(id))
        ),
      ];
      const idsToFetch = partnerIds.filter((id) => !partnerInfoMap[id]);
      if (idsToFetch.length === 0) return;

      const partnerPromises = idsToFetch.map((id) =>
        axios
          .get(`http://localhost:8000/api/food-partner/${id}`, {
            withCredentials: true,
          })
          .then((res) => ({
            id,
            name: res.data?.foodPartner?.name || "Partner",
            profilePhoto: res.data?.foodPartner?.profilePhoto,
          }))
          .catch((err) => ({ id, name: "Partner Error", profilePhoto: null }))
      );
      try {
        const results = await Promise.all(partnerPromises);
        const infoMapUpdates = results.reduce((acc, curr) => {
          acc[curr.id] = { name: curr.name, profilePhoto: curr.profilePhoto };
          return acc;
        }, {});
        setPartnerInfoMap((prevMap) => ({ ...prevMap, ...infoMapUpdates }));
      } catch (error) {
        console.error("Error fetching partner data:", error);
      }
    };
    fetchPartnerData();
  }, [videos, partnerInfoMap]);

  // Intersection Observer and Initial Scroll (Same as previous version, adapted slightly)
  useEffect(() => {
    if (!videos || videos.length === 0 || !containerRef.current) return;

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target;
        if (!(videoElement instanceof HTMLVideoElement)) return;
        const videoId = videoElement.dataset.id;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          if (!isActiveVideoId || isActiveVideoId === videoId) {
            videoElement.play().catch((e) => {}); // Muted autoplay usually allowed
            if (isActiveVideoId !== videoId) setIsActiveVideoId(videoId);
            setIsVideoPaused(false);
          } else {
            videoElement.pause();
          }
        } else {
          videoElement.pause();
          if (isActiveVideoId === videoId) {
            setIsVideoPaused(true);
          }
        }
      });
    };

    observer.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.6,
      root: containerRef.current,
    });
    const currentObserver = observer.current;

    videoRefs.current.forEach((videoElement) => {
      if (videoElement) currentObserver.observe(videoElement);
    });

    // Initial Scroll logic
    const scrollTimer = setTimeout(() => {
      if (!initialScrollDone.current && videos.length > startIndex) {
        const targetVideoId = videos[startIndex]?._id;
        const targetVideoElement = videoRefs.current.get(targetVideoId);
        if (targetVideoElement) {
          targetVideoElement
            .closest("section")
            ?.scrollIntoView({ behavior: "auto", block: "start" });
          targetVideoElement
            .play()
            .then(() => {
              setIsActiveVideoId(targetVideoId);
              setIsVideoPaused(false);
            })
            .catch((e) => {
              setIsActiveVideoId(targetVideoId);
              setIsVideoPaused(true);
            });
          initialScrollDone.current = true;
        }
      }
    }, 150);

    return () => {
      // Cleanup
      clearTimeout(scrollTimer);
      if (currentObserver) {
        videoRefs.current.forEach((videoElement) => {
          if (videoElement) currentObserver.unobserve(videoElement);
        });
        currentObserver.disconnect();
      }
    };
  }, [videos, startIndex]); // Dependencies for setup

  // Play/Pause Click Handler (Same as Reel.jsx)
  const handleClick = useCallback(() => {
    // Using useCallback now
    if (!isActiveVideoId) return;
    const activeVideo = videoRefs.current.get(isActiveVideoId);
    if (!activeVideo) return;
    const showAndHideIcon = () => {
      setIsIconDisplayed(true);
      setTimeout(() => setIsIconDisplayed(false), 500);
    };
    if (activeVideo.paused) {
      activeVideo.play().catch((e) => {});
      showAndHideIcon();
    } else {
      activeVideo.pause();
      showAndHideIcon();
    }
  }, [isActiveVideoId]); // Depends on isActiveVideoId

  // --- Interaction Handlers (Like/Save) - Mirroring Reel.jsx internal logic ---
  // These update the local 'videos' state optimistically first, then call API, then revert if needed
 // --- Interaction Handlers (Like/Save) - Using Sets ---
const handleLike = useCallback(async (videoId, currentLikeStatus) => {
    if (!videoId) return;

    // 1. Optimistic UI Update using setLikedSet
    setLikedSet((prevLikedSet) => {
        const newSet = new Set(prevLikedSet);
        if (currentLikeStatus) newSet.delete(videoId); // Unlike
        else newSet.add(videoId); // Like
        return newSet;
    });
    // Also update count optimistically in 'videos' state
    setVideos(currentVideos =>
        currentVideos.map(video => {
            if (video._id === videoId) {
                const newLikeCount = currentLikeStatus ? Math.max(0, (video.likeCount || 0) - 1) : (video.likeCount || 0) + 1;
                return { ...video, likeCount: newLikeCount };
            }
            return video;
        })
    );

    // 2. API Call
    try {
        const url = 'http://localhost:8000/api/feature/like';
        const config = { withCredentials: true };
        if (currentLikeStatus) await axios.delete(url, { data: { videoId }, ...config });
        else await axios.post(url, { videoId }, config);
    } catch (error) {
        console.error("Like API failed:", error);
        // 3. Revert UI on failure
        setLikedSet((prevLikedSet) => {
            const newSet = new Set(prevLikedSet);
            if (currentLikeStatus) newSet.add(videoId); // Add back if delete failed
            else newSet.delete(videoId); // Remove if add failed
            return newSet;
        });
        // Revert count
        setVideos(currentVideos =>
            currentVideos.map(video => {
                if (video._id === videoId) {
                    const revertedLikeCount = currentLikeStatus ? (video.likeCount || 0) + 1 : Math.max(0, (video.likeCount || 1) - 1);
                    return { ...video, likeCount: revertedLikeCount };
                }
                return video;
            })
        );
        // alert(`Failed to ${currentLikeStatus ? 'unlike' : 'like'}.`); // Optional user feedback
    }
}, []); // Empty dependencies

const handleSave = useCallback(async (videoId, currentSaveStatus) => {
    if (!videoId) return;

    // 1. Optimistic UI Update using setSavedSet
    setSavedSet((prevSavedSet) => {
        const newSet = new Set(prevSavedSet);
        if (currentSaveStatus) newSet.delete(videoId); // Unsave
        else newSet.add(videoId); // Save
        return newSet;
    });

    // 2. API Call
    try {
        const url = 'http://localhost:8000/api/feature/save';
        const config = { withCredentials: true };
        if (currentSaveStatus) await axios.delete(url, { data: { videoId }, ...config });
        else await axios.post(url, { videoId }, config);
    } catch (error) {
        console.error("Save API failed:", error);
        // 3. Revert UI on failure
        setSavedSet((prevSavedSet) => {
            const newSet = new Set(prevSavedSet);
            if (currentSaveStatus) newSet.add(videoId); // Add back if delete failed
            else newSet.delete(videoId); // Remove if add failed
            return newSet;
        });
        // alert(`Failed to ${currentSaveStatus ? 'unsave' : 'save'}.`); // Optional user feedback
    }
}, []); // Empty dependencies

  // Other Handlers (Comment, Buy, Close Panel - Same as previous version)
  const handleCommentClick = (e, videoId) => {
    e.stopPropagation();
    const videoElement = videoRefs.current.get(videoId);
    if (videoElement && !videoElement.paused) {
      videoElement.pause();
      if (videoId === isActiveVideoId) setIsVideoPaused(true);
    }
    setOpenCommentPanelId(videoId);
  };
  const closeCommentPanel = () => {
    const previouslyActiveVideoId = openCommentPanelId;
    setOpenCommentPanelId(null);
    if (previouslyActiveVideoId === isActiveVideoId && !isVideoPaused) {
      // Check !isVideoPaused before resuming
      const activeVideo = videoRefs.current.get(isActiveVideoId);
      if (activeVideo && activeVideo.paused)
        activeVideo.play().catch((e) => {});
    }
  };
  const handleBuyClick = (e, item) => {
    e.stopPropagation();
    if (!item) return;
    const itemToAdd = {
      _id: item._id,
      foodId: item._id,
      name: item.name,
      price: item.price,
      foodPartner: item.foodPartner,
    };
    addItemToCart(itemToAdd);
    console.log(`${item.name} added to Cart`);
  };

  // Ref callback (Same as previous version)
  const setVideoRef = useCallback((node, videoId) => {
    if (node) videoRefs.current.set(videoId, node);
    else videoRefs.current.delete(videoId);
  }, []);

  // --- Render ---
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <p>No reels found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-brand-orange">
          Go Back
        </button>
      </div>
    );
  }

  // Prepare videos with counts defaulted to 0 if null/undefined
// Prepare videos with interaction status from Sets
const videosToRender = videos.map((v) => ({
  ...v,
  likedByUser: likedSet.has(v._id), // Use likedSet
  savedByUser: savedSet.has(v._id), // Use savedSet
  likeCount: v.likeCount ?? 0,
  commentCount: v.commentCount ?? 0,
}));

  return (
    // Structure is identical to Reel.jsx, using 'videosToRender' state
    <div
      onClick={handleClick}
      className="fixed inset-0 h-dvh w-screen overflow-hidden bg-black select-none"
    >
      {/* Back Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(-1);
        }}
        className="fixed top-8 left-4 z-30 text-white hover:text-gray-300 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={30} />
      </button>

      {/* Scroll Container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {videosToRender.map(
          (
            item,
            index // Use videosToRender
          ) => (
            <section
              key={item._id || index}
              className="h-full w-full relative snap-start flex items-center justify-center bg-black"
              aria-label={`Reel for ${item.name || "food item"}`}
            >
              {/* {Pause & Play} */}
              {isIconDisplayed && isActiveVideoId === item._id && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-500 ease-in-out z-10 animate-fade-in-out">
                  {/* Added animation class */}
                  <div className="bg-black/50 p-4 rounded-full">
                    {/* Added background */}
                    {isVideoPaused ? (
                      <Play size={49} fill="white" className="text-white/90" /> // Adjusted opacity
                    ) : (
                      <Pause size={49} fill="white" className="text-white/90" /> // Adjusted opacity
                    )}
                  </div>
                </div>
              )}

              <video
                ref={(node) => setVideoRef(node, item._id)}
                src={item.video}
                muted
                playsInline
                loop
                preload="metadata"
                data-id={item._id}
                className="w-full h-full object-cover block"
                onPlay={() => {
                  if (item._id === isActiveVideoId) setIsVideoPaused(false);
                }}
                onPause={() => {
                  if (item._id === isActiveVideoId) setIsVideoPaused(true);
                }}
              />
              {/* Gradient */}
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

              {/* Right Actions */}
              <div className="absolute right-4 bottom-73 flex flex-col gap-5 items-center text-white">
                {/* Like */}
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
                    {item.likeCount}
                  </span>
                </button>
                {/* Comment */}
                <button
                  onClick={(e) => handleCommentClick(e, item._id)}
                  className="flex flex-col items-center gap-1 text-center group"
                  aria-label="View comments"
                >
                  <div className="p-3 bg-black/40 backdrop-blur-sm rounded-full group-hover:bg-white/20 transition duration-200">
                    <FaCommentDots
                      size={22}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>
                  <span className="text-xs font-semibold drop-shadow-md">
                    {item.commentCount}
                  </span>
                </button>
                {/* Save */}
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
                {/* Share */}
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
              {/* Bottom Info */}
              <div className="absolute bottom-16 md:bottom-12 left-0 w-full px-4 flex flex-col gap-3 z-20">
                <div className="flex flex-col gap-1 text-white text-shadow">
                  {/* Partner Info */}
                  <Link
                    to={`/food-partner/${item.foodPartner}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 group w-fit"
                  >
                    <img
                      src={
                        partnerInfoMap[item.foodPartner]?.profilePhoto ||
                        `https://ui-avatars.com/api/?name=${(
                          partnerInfoMap[item.foodPartner]?.name || "P"
                        ).charAt(0)}&background=random&color=fff&size=32`
                      }
                      alt={partnerInfoMap[item.foodPartner]?.name || "Partner"}
                      className="w-8 h-8 rounded-full object-cover border border-white/30 flex-shrink-0"
                    />
                    <span className="font-semibold text-sm group-hover:underline">
                      {partnerInfoMap[item.foodPartner]?.name || "Loading..."}
                    </span>
                  </Link>
                  {/* Description */}
                  <p className="text-xs line-clamp-2">
                    {item.description || " "}
                  </p>
                  {/* Name & Price */}
                  <p className="text-sm font-semibold flex justify-between items-center mt-1">
                    <span>{item.name}</span>
                    <span className="text-brand-orange font-bold text-base">
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
                    to={`/food-partner/${item.foodPartner}`}
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
          )
        )}
      </div>

      {/* Bottom Nav */}
      {!openCommentPanelId && <BottomNav />}
      {/* Comment Panel */}
      {openCommentPanelId && (
        <CommentPanel foodId={openCommentPanelId} onClose={closeCommentPanel} />
      )}
    </div>
  );
}

export default UserProfileReelsViewer;
