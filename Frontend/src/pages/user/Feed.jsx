import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Reel from "../../components/Reel";
import LoadingComponent from "../../components/LoadingComponent";
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function Feed() {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use Sets for fast O(1) lookups to check if a video is liked/saved
  const [likedSet, setLikedSet] = useState(new Set());
  const [savedSet, setSavedSet] = useState(new Set());

  const observer = useRef(); // For IntersectionObserver

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

      // Add the new IDs to our existing sets
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
      // Non-critical, so we don't set a hard error state
    }
  }, []); // This function is stable and doesn't need dependencies

  // --- API Call 2: Fetch paginated videos ---
  const fetchVideos = useCallback(
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
          `${apiUrl}/api/food/?page=${pageNum}&limit=5`, // Fetch 5 videos per page
          { withCredentials: true }
        );

        const { foodItems, hasMore: newHasMore } = res.data;

        if (foodItems && foodItems.length > 0) {
          // Add new videos to the existing list
          setVideos((prevVideos) => [...prevVideos, ...foodItems]);
          // Fetch interactions for *only* the new videos
          fetchInteractions(foodItems);
        }
        setHasMore(newHasMore);
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setError("Could not load feed. Please try again.");
      } finally {
        // **NEW: Wait for minimum loading time before hiding loader**
        await minLoadingTime;
        setLoading(false);
      }
    },
    [fetchInteractions]
  ); // Depends on fetchInteractions

  useEffect(() => {
    // Clear old data and fetch page 1 on mount
    setVideos([]);
    setLikedSet(new Set());
    setSavedSet(new Set());
    setPage(1);
    setHasMore(true);
    fetchVideos(1);
  }, [fetchVideos]); // Only runs once on mount due to useCallback

  // --- Infinite Scroll Observer ---
  const lastVideoElementRef = useCallback(
    (node) => {
      if (loading) return; // Don't trigger if already loading
      if (observer.current) observer.current.disconnect(); // Disconnect old observer

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // We're at the bottom and there's more to load
          console.log("Last video visible, fetching next page...");
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchVideos(nextPage);
            return nextPage;
          });
        }
      });

      if (node) observer.current.observe(node); // Observe the new last element
    },
    [loading, hasMore, fetchVideos]
  );

  const handleLikeToggle = useCallback((videoId, currentStatus) => {
    setLikedSet((prevLikedSet) => {
      const newSet = new Set(prevLikedSet);
      if (currentStatus) {
        newSet.delete(videoId); // It was liked, now un-like it
      } else {
        newSet.add(videoId); // It was not liked, now like it
      }
      return newSet;
    });
  }, []);

  const handleSaveToggle = useCallback((videoId, currentStatus) => {
    setSavedSet((prevSavedSet) => {
      const newSet = new Set(prevSavedSet);
      if (currentStatus) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  }, []);

  // This is crucial. We merge the video data with our interaction state
  // before passing it down to the Reel component.
  const videosWithStatus = videos.map((video) => ({
    ...video,
    likedByUser: likedSet.has(video._id),
    savedByUser: savedSet.has(video._id),
  }));

  // **NEW: Show loading component with minimum duration for initial load**
  if (loading && page === 1) {
    return <LoadingComponent message="Loading Feed..." minDuration={2000} />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="font-heading text-2xl text-brand-gray text-red-500">
          {error}
        </h1>
      </div>
    );
  }

  if (videos.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="font-heading text-2xl text-brand-gray">
          No videos found.
        </h1>
      </div>
    );
  }

  return (
    <div>
      <Reel
        listOfVideos={videosWithStatus}
        onLikeToggle={handleLikeToggle}
        onSaveToggle={handleSaveToggle}
        lastVideoRef={lastVideoElementRef} // Pass the ref for the observer
      />
      {/* Show loading indicator at the bottom while fetching more pages */}
      {loading && page > 1 && (
        <div className="text-center p-4 text-white">Loading more...</div>
      )}
      {!hasMore && (
        <div className="text-center p-4 text-white text-sm">
          You've reached the end!
        </div>
      )}
    </div>
  );
}

export default Feed;
