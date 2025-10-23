// FoodPartnerReels.jsx - FIXED VERSION
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Reel from "../../components/Reel";

function FoodPartnerReels() {
  const [reorderedVideos, setReorderedVideos] = useState([]);
  const { id, foodId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndReorderVideos = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/food-partner/${id}`,
          { withCredentials: true }
        );

        const videos = response.data.foodReels;

        if (!videos || videos.length === 0) {
          setReorderedVideos([]);
          setLoading(false);
          return;
        }

        // Find the index of the clicked video
        const clickedIndex = videos.findIndex((video) => video._id === foodId);

        if (clickedIndex === -1) {
          // If video not found, just use original order
          console.warn(`Video with id ${foodId} not found in the list`);
          setReorderedVideos(videos);
        } else {
          // Reorder: clicked video first, then rest
          const reordered = [
            ...videos.slice(clickedIndex),
            ...videos.slice(0, clickedIndex),
          ];
          setReorderedVideos(reordered);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setReorderedVideos([]);
        setLoading(false);
      }
    };

    fetchAndReorderVideos();
  }, [foodId,id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-offwhite">
        <h1 className="text-xl font-heading text-brand-gray">
          Loading reels...
        </h1>
      </div>
    );
  }

  if (reorderedVideos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-offwhite">
        <h1 className="text-xl font-heading text-brand-gray">
          No reels available
        </h1>
      </div>
    );
  }

  return <Reel listOfVideos={reorderedVideos} />;
}

export default FoodPartnerReels;
