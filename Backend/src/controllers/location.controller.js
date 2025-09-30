async function addUserLocation(req, res) {
  // const userId = req.user;
  const { coords } = req.body;

  if (!coords || !coords.lat || !coords.lng) {
    return res.status(400).json({
      message: "Coordinates are required",
      success: false,
    });
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${coords.lat}%2C+${coords.lng}&key=${process.env.OPENCAGE_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return res.status(200).json({
        message: "Location Fetched Successfully",
        success: true,
        address: data.results[0].formatted,
      });
    } else {
      return res.status(404).json({
        message: "Location not found",
        success: false,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching location",
      success: false,
      error: err.message,
    });
  }
}

module.exports = addUserLocation
