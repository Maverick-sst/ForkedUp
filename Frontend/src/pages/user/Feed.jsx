import React, { useState, useEffect } from "react";
import axios from "axios";
import Reel from "../../components/Reel";

function Feed() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading]= useState(true)
  // Fetch videos once on mount
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/food/", { withCredentials: true })
      .then((response) => {
        if (response.data && response.data.foodItems) {
          setVideos(response.data.foodItems);
        } else {
          setVideos([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch videos:", err);
        setVideos([]);
      })
      .finally(()=>setLoading(false))
  }, []);
  if(loading)return <h1>Loading...</h1>

  return <Reel listOfVideos={videos} />;
}

export default Feed;
