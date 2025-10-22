import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Reel from "../../components/Reel";

function FoodPartnerReels() {
  const [videos, setVideos] = useState([]);
  const { id, videoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [reorderedVideos, setReorderedVideos] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/food-partner/${id}`, {
        withCredentials: true,
      })
      .then((response) => {
        setVideos(response.data.foodReels);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  useEffect(() => {
    if (videos.length === 0) return;

    const index = videos.findIndex((video) => video._id.toString() === videoId );
    if (index === -1) {
      setReorderedVideos(videos);
    } else {
      setReorderedVideos([...videos.slice(index), ...videos.slice(0, index)]);
    }
    setLoading(false);
  }, [videos, videoId]);

  if (loading || videos.length === 0) {
    return <h1>loading...</h1>;
  }

  return <Reel listOfVideos={reorderedVideos} startingReelId={videoId} />;
}

export default FoodPartnerReels;
