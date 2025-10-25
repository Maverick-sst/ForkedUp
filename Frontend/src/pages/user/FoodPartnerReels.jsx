import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Reel from "../../components/Reel";
import LoadingComponent from "../../components/LoadingComponent";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function FoodPartnerReels() {
  const { id: foodPartnerId, foodId: initialFoodId } = useParams();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use Sets for fast O(1) lookups to check if a video is liked/saved
  const [likedSet, setLikedSet] = useState(new Set());
  const [savedSet, setSavedSet] = useState(new Set());

  const observer = useRef();

  // API Call 1: Fetch interactions for the given videos
  const fetchInteractions = useCallback(async (videoItems) => {
    if (videoItems.length === 0) return;
    const videoIds = videoItems.map((v) => v._id).join(",");

    try {
      const res = await axios.get(
        `${apiUrl}/api/feature/interactions?ids=${videoIds}`,
        { withCredentials: true }
      );
      const { liked, saved } = res.data;

      setLikedSet((prevLikedSet) => {
        const newSet = new Set(prevLikedSet);
        liked.forEach((id) => newSet.add(id));
        return newSet;
      });
      setSavedSet((prevSavedSet) => {
        const newSet = new Set(prevSavedSet);
        saved.forEach((id) => newSet.add(id));
        return newSet;
      });
    } catch (err) {
      console.error("Failed to fetch interactions:", err);
    }
  }, []);

  // API Call 2: Fetch paginated videos FOR THIS PARTNER
  const fetchPartnerVideos = useCallback(
    async (pageNum) => {
      setLoading(true);
      setError(null);

      // **NEW: Enforce minimum loading time ONLY for initial page load**
      const minLoadingTime =
        pageNum === 1
          ? new Promise((resolve) => setTimeout(resolve, 2000))
          : Promise.resolve(); // No delay for subsequent pages

      try {
        const res = await axios.get(
          `${apiUrl}/api/food-partner/${foodPartnerId}?page=${pageNum}&limit=5`,
          { withCredentials: true }
        );

        const { foodReels, hasMore: newHasMore } = res.data;

        if (foodReels && foodReels.length > 0) {
          let finalNewVideos = foodReels;

          // --- Reordering logic for initial load (page 1) ---
          if (pageNum === 1 && initialFoodId) {
            const clickedIndex = foodReels.findIndex(
              (video) => video._id === initialFoodId
            );
            if (clickedIndex > 0) {
              // Found it, but not at the start. Reorder.
              finalNewVideos = [
                ...foodReels.slice(clickedIndex),
                ...foodReels.slice(0, clickedIndex),
              ];
            }
            // If not found (clickedIndex === -1) or already first, just use the fetched order
          }

          setVideos((prevVideos) => [...prevVideos, ...finalNewVideos]);
          fetchInteractions(finalNewVideos);
        }
        setHasMore(newHasMore);
      } catch (err) {
        console.error("Failed to fetch partner videos:", err);
        setError("Could not load reels. Please try again.");
      } finally {
        // **NEW: Wait for minimum loading time before hiding loader**
        await minLoadingTime;
        setLoading(false);
      }
    },
    [foodPartnerId, initialFoodId, fetchInteractions]
  );

  useEffect(() => {
    // Clear old data and fetch page 1 on mount or when partnerId changes
    setVideos([]);
    setLikedSet(new Set());
    setSavedSet(new Set());
    setPage(1);
    setHasMore(true);
    fetchPartnerVideos(1);
  }, [foodPartnerId, fetchPartnerVideos]);

  const lastVideoElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("Last partner video visible, fetching next page...");
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchPartnerVideos(nextPage);
            return nextPage;
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchPartnerVideos]
  );

  const handleLikeToggle = useCallback((videoId, currentStatus) => {
    setLikedSet((prevLikedSet) => {
      const newSet = new Set(prevLikedSet);
      if (currentStatus) newSet.delete(videoId);
      else newSet.add(videoId);
      return newSet;
    });
  }, []);

  const handleSaveToggle = useCallback((videoId, currentStatus) => {
    setSavedSet((prevSavedSet) => {
      const newSet = new Set(prevSavedSet);
      if (currentStatus) newSet.delete(videoId);
      else newSet.add(videoId);
      return newSet;
    });
  }, []);

  const videosWithStatus = videos.map((video) => ({
    ...video,
    likedByUser: likedSet.has(video._id),
    savedByUser: savedSet.has(video._id),
  }));

  // **NEW: Show loading component with minimum duration for initial load**
  if (loading && page === 1) {
    return (
      <LoadingComponent message="Loading Partner Reels..." minDuration={2000} />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-brand-offwhite p-4 text-center">
        <h1 className="font-heading text-2xl text-brand-gray font-heading text-red-500 mb-4">
          {error}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-brand-orange text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (videos.length === 0 && !loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-brand-offwhite p-4 text-center">
        <h1 className="font-heading text-2xl text-brand-gray font-heading text-brand-gray">
          No reels available from this partner.
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-brand-orange text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <Reel
        listOfVideos={videosWithStatus}
        onLikeToggle={handleLikeToggle}
        onSaveToggle={handleSaveToggle}
        lastVideoRef={lastVideoElementRef}
      />
      {loading && page > 1 && (
        <div className="text-center p-4 text-white">Loading more...</div>
      )}
      {!hasMore && (
        <div className="text-center p-4 text-white text-sm">
          You've seen all reels from this partner!
        </div>
      )}
    </div>
  );
}

export default FoodPartnerReels;
